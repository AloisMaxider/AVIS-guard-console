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
export type GlobalTimeRange = "24h" | "7d" | "30d" | "custom";

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

const getTimeCutoff = (
  timeRange: GlobalTimeRange,
  customDateFrom?: Date,
  customDateTo?: Date
) => {
  const now = Date.now();
  if (timeRange === "24h") return { from: new Date(now - 24 * 60 * 60 * 1000), to: undefined };
  if (timeRange === "7d") return { from: new Date(now - 7 * 24 * 60 * 60 * 1000), to: undefined };
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

const typeOfReport = (value: unknown) => String(value ?? "").toLowerCase();
const typeOfInsight = (value: unknown) => String(value ?? "").toLowerCase();

const getOrgScope = (
  organizations: Organization[],
  scope: GlobalScope,
  selectedOrgIds: string[]
) => {
  if (scope === "specific") {
    return selectedOrgIds.length > 0 ? selectedOrgIds.slice(0, 1) : [];
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
  const [rawReports, setRawReports] = useState<GlobalReportItem[]>([]);
  const [rawInsights, setRawInsights] = useState<GlobalInsightItem[]>([]);
  const [rawVeeamJobs, setRawVeeamJobs] = useState<GlobalVeeamJobItem[]>([]);

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

        if (reportsRes?.ok) {
          const parsed = await safeParseResponse<unknown[]>(reportsRes, WEBHOOK_REPORTS_URL);
          if (parsed.ok && Array.isArray(parsed.data)) {
            const mapped: GlobalReportItem[] = parsed.data.map((entry, index) => {
              const item = asRecord(entry);
              const clientId = toNumberOrNull(item?.client_id ?? item?.clientId);
              const org = clientId ? orgMapByClientId.get(clientId) : undefined;
              const createdAt = item?.created_at ? new Date(item.created_at) : new Date();
              return {
                id: String(item?.id ?? item?.report_id ?? `global-report-${index}`),
                name: String(item?.name ?? item?.title ?? "Report"),
                report_type: String(item?.report_type ?? item?.type ?? "daily"),
                report_template: typeof item?.report_template === "string" ? item.report_template : undefined,
                status: String(item?.status ?? "completed"),
                created_at: createdAt,
                client_id: clientId ?? undefined,
                organizationId: org?.id ?? null,
                organizationName: org?.name ?? "Unknown Organization",
                clientId,
              };
            });
            setRawReports(mapped);
          } else {
            setRawReports([]);
          }
        } else {
          setRawReports([]);
        }

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
    [authenticatedFetch, enabled, orgMapByClientId]
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

  const reports = useMemo(
    () =>
      rawReports.filter(
        (item) => inScope(item.organizationId) && isWithinTimeRange(item.created_at, rangeFrom, rangeTo)
      ),
    [rawReports, inScope, rangeFrom, rangeTo]
  );

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
        total: reports.length,
        daily: reports.filter((r) => typeOfReport(r.report_type) === "daily").length,
        weekly: reports.filter((r) => typeOfReport(r.report_type) === "weekly").length,
        monthly: reports.filter((r) => typeOfReport(r.report_type) === "monthly").length,
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
    [alerts, hosts, reports, insights, veeamJobs]
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

  const reportsBreakdown = useMemo(
    () =>
      buildBreakdown(reports, (items) => ({
        total: items.length,
        secondary: items.filter((r) => typeOfReport(r.report_type) === "daily").length,
        tertiary: items.filter((r) => typeOfReport(r.report_type) === "weekly").length,
      })),
    [reports, buildBreakdown]
  );

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
