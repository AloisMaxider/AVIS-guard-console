import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { safeParseResponse } from "@/lib/safeFetch";
import {
  WEBHOOK_AI_INSIGHTS_URL,
  WEBHOOK_ALERTS_URL,
  WEBHOOK_BACKUP_REPLICATION_URL,
  WEBHOOK_REPORTS_URL,
  WEBHOOK_ZABBIX_HOSTS_URL,
} from "@/config/env";
import type { Organization } from "./types";
import type {
  AlertItem,
  HostItem,
  InsightItem,
  ReportItem,
  VeeamJobItem,
} from "./useOrganizationDetails";

export type GlobalScope = "all" | "specific";
export type GlobalTimeRange = "24h" | "7d" | "30d" | "custom" | "all";

export type GlobalAlertItem = AlertItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export type GlobalHostItem = HostItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export type GlobalReportItem = ReportItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export type GlobalInsightItem = InsightItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export type GlobalVeeamJobItem = VeeamJobItem & {
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
};

export interface GlobalMetricSummary {
  alerts: { total: number; active: number; critical: number };
  hosts: { total: number; enabled: number; disabled: number };
  reports: { total: number; daily: number; weekly: number; monthly: number };
  insights: { total: number; predictions: number; anomalies: number };
  veeam: { jobs: number; success: number; failed: number };
}

export interface CategoryBreakdownRow {
  organizationId: string;
  organizationName: string;
  total: number;
  secondary: number;
  tertiary: number;
}

interface GlobalReportLiteItem {
  id: string;
  organizationId: string | null;
  organizationName: string;
  clientId: number | null;
  reportType: string;
  createdAtMs: number;
}

interface UseGlobalInfrastructureMetricsOptions {
  organizations: Organization[];
  scope: GlobalScope;
  selectedOrgIds: string[];
  timeRange: GlobalTimeRange;
  customDateFrom?: Date;
  customDateTo?: Date;
  enabled?: boolean;
}

const REFRESH_INTERVAL = 60_000;
type UnknownRecord = Record<string, unknown>;

let reportsDetailsRequestedGlobal = false;
const reportsDetailsSubscribers = new Set<() => void>();

export const requestGlobalReportsDetails = () => {
  if (reportsDetailsRequestedGlobal) return;
  reportsDetailsRequestedGlobal = true;
  reportsDetailsSubscribers.forEach((notify) => notify());
};

const toNumberOrNull = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const inferSeverity = (value: unknown): string => {
  const raw = String(value ?? "").toLowerCase();
  if (!raw) return "info";
  return raw;
};

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractReportsRecords = (value: unknown): UnknownRecord[] => {
  if (Array.isArray(value)) {
    return value.map(asRecord);
  }
  const root = asRecord(value);
  const candidates = [root.reports, root.items, root.data, root.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(asRecord);
    }
  }
  return [];
};

const extractClientIdFromRecord = (record: UnknownRecord): number | null => {
  const meta = asRecord(record.meta);
  const org = asRecord(record.organization);
  const nestedOrg = asRecord(record.org);
  return (
    toNumberOrNull(record.client_id ?? record.clientId) ??
    toNumberOrNull(meta.client_id ?? meta.clientId) ??
    toNumberOrNull(org.client_id ?? org.clientId) ??
    toNumberOrNull(nestedOrg.client_id ?? nestedOrg.clientId)
  );
};

const normalizeReportType = (record: UnknownRecord): string => {
  const raw = String(
    record.report_type ?? record.type ?? record.frequency ?? record.period ?? "daily"
  )
    .trim()
    .toLowerCase();
  if (raw === "day") return "daily";
  if (raw === "week") return "weekly";
  if (raw === "month") return "monthly";
  return raw;
};

const extractReportTimestamp = (record: UnknownRecord): number => {
  const value =
    record.created_at ??
    record.createdAt ??
    record.generated_at ??
    record.generatedAt ??
    record.timestamp ??
    record.time ??
    record.date;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? value : value * 1000;
  }
  const parsed = value ? new Date(String(value)).getTime() : NaN;
  if (Number.isFinite(parsed)) return parsed;
  return Date.now();
};

const extractReportId = (
  record: UnknownRecord,
  fallbackIndex: number,
  reportType: string,
  createdAtMs: number,
  clientId: number | null
): string =>
  String(
    record.id ??
    record.report_id ??
    record.uuid ??
    record.guid ??
    `${clientId ?? "na"}-${reportType}-${createdAtMs}-${fallbackIndex}`
  );

const normalizeReportTemplate = (record: UnknownRecord): string | undefined => {
  const template = record.report_template;
  if (typeof template === "string") return template;
  return undefined;
};

const mapReportRecord = (
  record: UnknownRecord,
  index: number,
  orgMapByClientId: Map<number, Organization>
): { lite: GlobalReportLiteItem; detail: GlobalReportItem } => {
  const clientId = extractClientIdFromRecord(record);
  const org = clientId != null ? orgMapByClientId.get(clientId) : undefined;
  const reportType = normalizeReportType(record);
  const createdAtMs = extractReportTimestamp(record);
  const id = extractReportId(record, index, reportType, createdAtMs, clientId);
  const name = String(
    record.name ??
    record.title ??
    record.report_name ??
    record.reportTitle ??
    `${reportType} report`
  );
  const status = String(record.status ?? record.state ?? "completed");
  const createdAt = new Date(createdAtMs);
  const organizationId = org?.id ?? null;
  const organizationName = org?.name ?? "Unknown Organization";
  const template = normalizeReportTemplate(record);

  return {
    lite: {
      id,
      organizationId,
      organizationName,
      clientId,
      reportType,
      createdAtMs,
    },
    detail: {
      id,
      name,
      report_type: reportType,
      report_template: template,
      status,
      created_at: createdAt,
      client_id: clientId ?? undefined,
      organizationId,
      organizationName,
      clientId,
    },
  };
};

const getTimeCutoff = (
  timeRange: GlobalTimeRange,
  customDateFrom?: Date,
  customDateTo?: Date
) => {
  const now = Date.now();

  if (timeRange === "all") {
    return { from: undefined, to: undefined }; 
  }

  if (timeRange === "24h") return { from: new Date(now - 24 * 60 * 60 * 1000), to: undefined };
  if (timeRange === "7d")  return { from: new Date(now - 7 * 24 * 60 * 60 * 1000), to: undefined };
  if (timeRange === "30d") return { from: new Date(now - 30 * 24 * 60 * 60 * 1000), to: undefined };

  return { from: customDateFrom, to: customDateTo };
};

const isWithinTimeRange = (date: Date | undefined, from?: Date, to?: Date) => {
  if (!date) return true;
  const ts = date.getTime();
  if (from && ts < from.getTime()) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (ts > end.getTime()) return false;
  }
  return true;
};

const typeOfInsight = (value: unknown) => String(value ?? "").toLowerCase();

const getOrgScope = (
  organizations: Organization[],
  scope: GlobalScope,
  selectedOrgIds: string[]
) => {
  if (scope === "specific") {
    // ───────────────────────────────────────────────────────────────
    // CHANGED: previously limited to first org → now includes all selected
    return selectedOrgIds;
    // If you want to keep single-org behavior in some views, consider
    // renaming this scope or handling it in the calling component instead.
  }
  return selectedOrgIds;
};

export const useGlobalInfrastructureMetrics = ({
  organizations,
  scope,
  selectedOrgIds,
  timeRange,
  customDateFrom,
  customDateTo,
  enabled = true,
}: UseGlobalInfrastructureMetricsOptions) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [rawAlerts, setRawAlerts] = useState<GlobalAlertItem[]>([]);
  const [rawHosts, setRawHosts] = useState<GlobalHostItem[]>([]);
  const [rawReportLiteItems, setRawReportLiteItems] = useState<GlobalReportLiteItem[]>([]);
  const [rawReportRecords, setRawReportRecords] = useState<UnknownRecord[]>([]);
  const [rawReportDetails, setRawReportDetails] = useState<GlobalReportItem[]>([]);
  const [rawInsights, setRawInsights] = useState<GlobalInsightItem[]>([]);
  const [rawVeeamJobs, setRawVeeamJobs] = useState<GlobalVeeamJobItem[]>([]);

  const [reportsDetailsRequested, setReportsDetailsRequested] = useState(
    reportsDetailsRequestedGlobal
  );

  const orgMapByClientId = useMemo(() => {
    const map = new Map<number, Organization>();
    organizations.forEach((org) => {
      if (org.clientId > 0) map.set(org.clientId, org);
    });
    return map;
  }, [organizations]);

  const orgMapById = useMemo(() => {
    const map = new Map<string, Organization>();
    organizations.forEach((org) => map.set(org.id, org));
    return map;
  }, [organizations]);

  useEffect(() => {
    const notify = () => setReportsDetailsRequested(true);
    reportsDetailsSubscribers.add(notify);
    return () => {
      reportsDetailsSubscribers.delete(notify);
    };
  }, []);

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!enabled) return;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!silent) setLoading(true);
      setError(null);

      try {
        const commonPost = {
          method: "POST" as const,
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({}),
          signal: abortControllerRef.current.signal,
        };

        const [alertsRes, hostsRes, reportsRes, insightsRes, veeamRes] = await Promise.all([
          authenticatedFetch(WEBHOOK_ALERTS_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_ZABBIX_HOSTS_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_REPORTS_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_AI_INSIGHTS_URL, commonPost).catch(() => null),
          authenticatedFetch(WEBHOOK_BACKUP_REPLICATION_URL, commonPost).catch(() => null),
        ]);

        // ───────────────────────────────────────────────────────────────
        // Alerts parsing (unchanged)
        // ───────────────────────────────────────────────────────────────
        if (alertsRes?.ok) {
          const parsed = await safeParseResponse<unknown[]>(alertsRes, WEBHOOK_ALERTS_URL);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const mapped: GlobalAlertItem[] = parsed.data.map((entry, index) => {
              const item = asRecord(entry);
              const zbxRaw = asRecord(item.zbx_raw);
              const clientId = toNumberOrNull(item?.client_id ?? item?.clientId);
              const org = clientId ? orgMapByClientId.get(clientId) : undefined;
              const timestampValue = item?.created_at ?? item?.first_seen ?? item?.last_seen_at;
              const timestamp = timestampValue ? new Date(timestampValue) : new Date();
              return {
                id: String(item?.eventid ?? item?.id ?? `global-alert-${index}`),
                title: String(item?.problem_name ?? item?.description ?? item?.title ?? "Alert"),
                message: String(item?.first_ai_response ?? item?.response_content ?? ""),
                severity: inferSeverity(item?.severity ?? zbxRaw.severity),
                status: String(item?.status ?? (item?.acknowledged ? "acknowledged" : "active")),
                host: String(item?.host ?? ""),
                timestamp,
                acknowledged: Boolean(item?.acknowledged),
                eventid: String(item?.eventid ?? ""),
                organizationId: org?.id ?? null,
                organizationName: org?.name ?? "Unknown Organization",
                clientId,
              };
            });
            setRawAlerts(mapped);
          } else {
            setRawAlerts([]);
          }
        } else {
          setRawAlerts([]);
        }

        // Hosts parsing (unchanged)
        if (hostsRes?.ok) {
          const parsed = await safeParseResponse<unknown[]>(hostsRes, WEBHOOK_ZABBIX_HOSTS_URL);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const mapped: GlobalHostItem[] = parsed.data.map((entry, index) => {
              const item = asRecord(entry);
              const groupsJson = asRecord(item.groups_json);
              const clientId = toNumberOrNull(item?.client_id ?? item?.clientId);
              const org = clientId ? orgMapByClientId.get(clientId) : undefined;
              const groups = Array.isArray(groupsJson.groups)
                ? groupsJson.groups.map((groupItem: unknown) => {
                    const groupRecord = asRecord(groupItem);
                    return String(groupRecord.name ?? groupItem ?? "");
                  })
                : [];
              return {
                hostid: String(item?.hostid ?? item?.id ?? `global-host-${index}`),
                host: String(groupsJson.ip ?? item?.host ?? "Unknown"),
                name: String(groupsJson.name ?? item?.name ?? "Host"),
                status: typeof item?.status === "number" ? item.status : Number(item?.status ?? 0),
                available: toNumberOrNull(item?.available) ?? undefined,
                groups,
                organizationId: org?.id ?? null,
                organizationName: org?.name ?? "Unknown Organization",
                clientId,
              };
            });
            setRawHosts(mapped);
          } else {
            setRawHosts([]);
          }
        } else {
          setRawHosts([]);
        }

        // Reports parsing ────────────────────────────────────────────────
        if (reportsRes?.ok) {
          const parsed = await safeParseResponse<unknown>(reportsRes, WEBHOOK_REPORTS_URL);
          if (parsed.ok && parsed.data != null) {
            const records = extractReportsRecords(parsed.data);
            const liteItems: GlobalReportLiteItem[] = [];
            const detailedItems: GlobalReportItem[] = [];

            for (let index = 0; index < records.length; index += 1) {
              const mapped = mapReportRecord(records[index], index, orgMapByClientId);
              liteItems.push(mapped.lite);
              if (reportsDetailsRequested) {
                detailedItems.push(mapped.detail);
              }
            }

            setRawReportRecords(records);
            setRawReportLiteItems(liteItems);
            if (reportsDetailsRequested) {
              setRawReportDetails(detailedItems);
            } else {
              setRawReportDetails([]);
            }
          } else {
            setRawReportRecords([]);
            setRawReportLiteItems([]);
            setRawReportDetails([]);
          }
        } else {
          setRawReportRecords([]);
          setRawReportLiteItems([]);
          setRawReportDetails([]);
        }

        // Insights parsing (unchanged)
        if (insightsRes?.ok) {
          const parsed = await safeParseResponse<unknown[]>(insightsRes, WEBHOOK_AI_INSIGHTS_URL);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const mapped: GlobalInsightItem[] = parsed.data.map((entry, index) => {
              const item = asRecord(entry);
              const meta = asRecord(item.meta);
              const clientId = toNumberOrNull(item?.client_id ?? item?.clientId ?? item?.meta?.client_id);
              const effectiveClientId = clientId ?? toNumberOrNull(meta.client_id);
              const org = effectiveClientId ? orgMapByClientId.get(effectiveClientId) : undefined;
              const timestampValue = item?.created_at ?? item?.timestamp ?? item?.time;
              const timestamp = timestampValue ? new Date(timestampValue) : new Date();
              return {
                id: String(item?.id ?? item?.insight_id ?? `global-insight-${index}`),
                type: String(item?.type ?? item?.insight_type ?? item?.category ?? "insight"),
                title: String(item?.title ?? item?.name ?? "AI Insight"),
                summary: String(item?.summary ?? item?.description ?? item?.message ?? ""),
                severity: inferSeverity(item?.severity),
                timestamp,
                client_id: effectiveClientId ?? undefined,
                organizationId: org?.id ?? null,
                organizationName: org?.name ?? "Unknown Organization",
                clientId: effectiveClientId,
              };
            });
            setRawInsights(mapped);
          } else {
            setRawInsights([]);
          }
        } else {
          setRawInsights([]);
        }

        // Veeam parsing (unchanged)
        if (veeamRes?.ok) {
          const parsed = await safeParseResponse<unknown>(veeamRes, WEBHOOK_BACKUP_REPLICATION_URL);
          if (parsed.ok && parsed.data) {
            const arr = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
            const main = asRecord(arr[0]);
            const matched = Array.isArray(main.matched) ? main.matched : [];
            const jobs: GlobalVeeamJobItem[] = [];

            matched.forEach((vmEntry: unknown, vmIndex: number) => {
              const vm = asRecord(vmEntry);
              const vmJobs = Array.isArray(vm.jobs) ? vm.jobs : [];
              vmJobs.forEach((jobEntry: unknown, jobIndex: number) => {
                const job = asRecord(jobEntry);
                const parsedJob = asRecord(job.parsedJob);
                const vmMeta = asRecord(vm.vm);
                const protectionSummary = asRecord(vm.protectionSummary);
                const backupStatus = asRecord(job.backupStatus);
                const clientId = toNumberOrNull(
                  job?.client_id ??
                  job?.clientId ??
                  parsedJob.client_id ??
                  parsedJob.clientId ??
                  vm?.client_id ??
                  vm?.clientId
                );
                const org = clientId ? orgMapByClientId.get(clientId) : undefined;
                const statusRaw = String(
                  backupStatus.status ??
                  backupStatus.jobStatus ??
                  protectionSummary.overallStatus ??
                  "unknown"
                ).toLowerCase();
                const severity = statusRaw.includes("success")
                  ? "success"
                  : statusRaw.includes("warn")
                  ? "warning"
                  : statusRaw.includes("fail") || statusRaw.includes("error")
                  ? "failed"
                  : "unknown";
                const lastRun = job?.lastRun ? new Date(job.lastRun) : undefined;

                jobs.push({
                  id: `${clientId ?? "na"}-${vmIndex}-${jobIndex}`,
                  name: String(job?.jobName ?? vmMeta.name ?? "Veeam Job"),
                  type: String(job?.jobType ?? ""),
                  severity,
                  status: severity,
                  lastRun,
                  organizationId: org?.id ?? null,
                  organizationName: org?.name ?? "Unknown Organization",
                  clientId,
                });
              });
            });

            setRawVeeamJobs(jobs);
          } else {
            setRawVeeamJobs([]);
          }
        } else {
          setRawVeeamJobs([]);
        }

        setIsConnected(true);
        setLastUpdated(new Date());
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Failed to load global infrastructure metrics");
          setIsConnected(false);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [authenticatedFetch, enabled, orgMapByClientId, reportsDetailsRequested]
  );

  useEffect(() => {
    fetchAll(false);
  }, [fetchAll]);

  useEffect(() => {
    if (!enabled) return;
    intervalRef.current = setInterval(() => fetchAll(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [enabled, fetchAll]);

  useEffect(() => {
    if (!reportsDetailsRequested) return;
    if (rawReportRecords.length === 0) {
      setRawReportDetails([]);
      return;
    }
    const detailedItems = new Array<GlobalReportItem>(rawReportRecords.length);
    for (let index = 0; index < rawReportRecords.length; index += 1) {
      detailedItems[index] = mapReportRecord(rawReportRecords[index], index, orgMapByClientId).detail;
    }
    setRawReportDetails(detailedItems);
  }, [reportsDetailsRequested, rawReportRecords, orgMapByClientId]);

  const orgScopeIds = useMemo(
    () => getOrgScope(organizations, scope, selectedOrgIds),
    [organizations, scope, selectedOrgIds]
  );

  const scopedOrgIdsSet = useMemo(() => {
    if (orgScopeIds.length === 0) return null;
    return new Set(orgScopeIds);
  }, [orgScopeIds]);

  const { from: rangeFrom, to: rangeTo } = useMemo(
    () => getTimeCutoff(timeRange, customDateFrom, customDateTo),
    [timeRange, customDateFrom, customDateTo]
  );

  const rangeFromMs = rangeFrom?.getTime();
  const rangeToMs = useMemo(() => {
    if (!rangeTo) return undefined;
    const end = new Date(rangeTo);
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  }, [rangeTo]);

  const inScope = useCallback(
    (organizationId: string | null) => {
      if (!scopedOrgIdsSet) return true;
      if (!organizationId) return false;
      return scopedOrgIdsSet.has(organizationId);
    },
    [scopedOrgIdsSet]
  );

  const alerts = useMemo(
    () =>
      rawAlerts.filter(
        (item) => inScope(item.organizationId) && isWithinTimeRange(item.timestamp, rangeFrom, rangeTo)
      ),
    [rawAlerts, inScope, rangeFrom, rangeTo]
  );

  const hosts = useMemo(() => rawHosts.filter((item) => inScope(item.organizationId)), [rawHosts, inScope]);

  const filteredReportsMeta = useMemo(() => {
    const selectedIds = new Set<string>();
    const breakdownByOrg = new Map<
      string,
      { organizationName: string; total: number; daily: number; weekly: number }
    >();
    let total = 0;
    let daily = 0;
    let weekly = 0;
    let monthly = 0;

    for (let index = 0; index < rawReportLiteItems.length; index += 1) {
      const item = rawReportLiteItems[index];
      if (!inScope(item.organizationId)) continue;
      if (rangeFromMs != null && item.createdAtMs < rangeFromMs) continue;
      if (rangeToMs != null && item.createdAtMs > rangeToMs) continue;

      total += 1;
      selectedIds.add(item.id);

      if (item.reportType === "daily") daily += 1;
      else if (item.reportType === "weekly") weekly += 1;
      else if (item.reportType === "monthly") monthly += 1;

      const key = item.organizationId ?? "unknown";
      const existing = breakdownByOrg.get(key);
      if (!existing) {
        breakdownByOrg.set(key, {
          organizationName: item.organizationName,
          total: 1,
          daily: item.reportType === "daily" ? 1 : 0,
          weekly: item.reportType === "weekly" ? 1 : 0,
        });
      } else {
        existing.total += 1;
        if (item.reportType === "daily") existing.daily += 1;
        if (item.reportType === "weekly") existing.weekly += 1;
      }
    }

    return { total, daily, weekly, monthly, selectedIds, breakdownByOrg };
  }, [rawReportLiteItems, inScope, rangeFromMs, rangeToMs]);

  const reports = useMemo(() => {
    if (!reportsDetailsRequested) return [];
    if (filteredReportsMeta.selectedIds.size === 0) return [];

    const items: GlobalReportItem[] = [];
    for (let index = 0; index < rawReportDetails.length; index += 1) {
      const report = rawReportDetails[index];
      if (filteredReportsMeta.selectedIds.has(report.id)) {
        items.push(report);
      }
    }
    return items;
  }, [reportsDetailsRequested, rawReportDetails, filteredReportsMeta]);

  const insights = useMemo(
    () =>
      rawInsights.filter(
        (item) => inScope(item.organizationId) && isWithinTimeRange(item.timestamp, rangeFrom, rangeTo)
      ),
    [rawInsights, inScope, rangeFrom, rangeTo]
  );

  const veeamJobs = useMemo(
    () =>
      rawVeeamJobs.filter(
        (item) => inScope(item.organizationId) && isWithinTimeRange(item.lastRun, rangeFrom, rangeTo)
      ),
    [rawVeeamJobs, inScope, rangeFrom, rangeTo]
  );

  const summary = useMemo<GlobalMetricSummary>(
    () => ({
      alerts: {
        total: alerts.length,
        active: alerts.filter((a) => !a.acknowledged && a.status !== "resolved").length,
        critical: alerts.filter((a) => {
          const sev = a.severity.toLowerCase();
          return sev === "critical" || sev === "disaster";
        }).length,
      },
      hosts: {
        total: hosts.length,
        enabled: hosts.filter((h) => h.status === 0).length,
        disabled: hosts.filter((h) => h.status !== 0).length,
      },
      reports: {
        total: filteredReportsMeta.total,
        daily: filteredReportsMeta.daily,
        weekly: filteredReportsMeta.weekly,
        monthly: filteredReportsMeta.monthly,
      },
      insights: {
        total: insights.length,
        predictions: insights.filter((i) => typeOfInsight(i.type).includes("predict")).length,
        anomalies: insights.filter((i) => typeOfInsight(i.type).includes("anomal")).length,
      },
      veeam: {
        jobs: veeamJobs.length,
        success: veeamJobs.filter((j) => String(j.severity).toLowerCase() === "success").length,
        failed: veeamJobs.filter((j) => {
          const sev = String(j.severity).toLowerCase();
          return sev === "failed" || sev === "error";
        }).length,
      },
    }),
    [alerts, hosts, filteredReportsMeta, insights, veeamJobs]
  );

  const buildBreakdown = useCallback(
    (
      rows: Array<{ organizationId: string | null; organizationName: string; [k: string]: unknown }>,
      mapper: (items: Array<Record<string, unknown>>) => { total: number; secondary: number; tertiary: number }
    ): CategoryBreakdownRow[] => {
      const grouped = new Map<string, Array<Record<string, unknown>>>();
      rows.forEach((row) => {
        const orgId = row.organizationId ?? "unknown";
        if (!grouped.has(orgId)) grouped.set(orgId, []);
        grouped.get(orgId)!.push(row);
      });

      return Array.from(grouped.entries())
        .map(([orgId, items]) => {
          const baseOrg =
            orgMapById.get(orgId) ??
            organizations.find((o) => o.name === items[0]?.organizationName);
          const metrics = mapper(items);
          return {
            organizationId: baseOrg?.id ?? orgId,
            organizationName: baseOrg?.name ?? String(items[0]?.organizationName ?? "Unknown Organization"),
            ...metrics,
          };
        })
        .sort((a, b) => b.total - a.total || a.organizationName.localeCompare(b.organizationName));
    },
    [orgMapById, organizations]
  );

  const alertsBreakdown = useMemo(
    () =>
      buildBreakdown(alerts, (items) => ({
        total: items.length,
        secondary: items.filter((a) => !a.acknowledged && a.status !== "resolved").length,
        tertiary: items.filter((a) => {
          const sev = String(a.severity).toLowerCase();
          return sev === "critical" || sev === "disaster";
        }).length,
      })),
    [alerts, buildBreakdown]
  );

  const hostsBreakdown = useMemo(
    () =>
      buildBreakdown(hosts, (items) => ({
        total: items.length,
        secondary: items.filter((h) => h.status === 0).length,
        tertiary: items.filter((h) => h.status !== 0).length,
      })),
    [hosts, buildBreakdown]
  );

  const reportsBreakdown = useMemo(() => {
    const rows: CategoryBreakdownRow[] = [];
    filteredReportsMeta.breakdownByOrg.forEach((metrics, orgIdKey) => {
      const baseOrg = orgMapById.get(orgIdKey);
      rows.push({
        organizationId: baseOrg?.id ?? orgIdKey,
        organizationName: baseOrg?.name ?? metrics.organizationName,
        total: metrics.total,
        secondary: metrics.daily,
        tertiary: metrics.weekly,
      });
    });
    return rows.sort((a, b) => b.total - a.total || a.organizationName.localeCompare(b.organizationName));
  }, [filteredReportsMeta, orgMapById]);

  const insightsBreakdown = useMemo(
    () =>
      buildBreakdown(insights, (items) => ({
        total: items.length,
        secondary: items.filter((i) => typeOfInsight(i.type).includes("predict")).length,
        tertiary: items.filter((i) => typeOfInsight(i.type).includes("anomal")).length,
      })),
    [insights, buildBreakdown]
  );

  const veeamBreakdown = useMemo(
    () =>
      buildBreakdown(veeamJobs, (items) => ({
        total: items.length,
        secondary: items.filter((j) => String(j.severity).toLowerCase() === "success").length,
        tertiary: items.filter((j) => {
          const sev = String(j.severity).toLowerCase();
          return sev === "failed" || sev === "error";
        }).length,
      })),
    [veeamJobs, buildBreakdown]
  );

  return {
    loading,
    error,
    isConnected,
    lastUpdated,
    refresh: () => fetchAll(false),
    summary,
    alerts,
    hosts,
    reports,
    insights,
    veeamJobs,
    alertsBreakdown,
    hostsBreakdown,
    reportsBreakdown,
    insightsBreakdown,
    veeamBreakdown,
  };
};

export default useGlobalInfrastructureMetrics;