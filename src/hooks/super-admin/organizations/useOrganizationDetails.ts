/**
 * Super Admin Organization Details Hook
 * Provides detailed data for each drilldown category
 * Lazy-loads data only when a category is selected
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";

// Reuse existing endpoint patterns
const ENDPOINTS = {
  alerts: "http://localhost:5678/webhook/ai/insights",
  hosts: "http://localhost:5678/webhook/zabbix-hosts",
  reports: "http://localhost:5678/webhook/reports",
  insights: "http://localhost:5678/webhook/agent-insights",
  veeam: "http://10.100.12.141:5678/webhook/backupandreplication",
};

export type DrilldownCategory = "alerts" | "hosts" | "reports" | "insights" | "veeam" | "users" | null;

export interface AlertItem {
  id: string;
  eventid?: string;
  title: string;
  message?: string;
  severity: string;
  status: string;
  host?: string;
  timestamp: Date;
  acknowledged?: boolean;
}

export interface HostItem {
  hostid: string;
  host: string;
  name: string;
  status: number;
  available?: number;
  groups?: string[];
  lastAccess?: Date;
}

export interface ReportItem {
  id: string;
  name: string;
  report_type: string;
  status: string;
  created_at: Date;
  client_id?: number;
}

export interface InsightItem {
  id: string;
  type: string;
  title: string;
  summary: string;
  severity?: string;
  timestamp: Date;
  client_id?: number;
}

export interface VeeamJobItem {
  id: string;
  name: string;
  type?: string;
  severity: string;
  lastRun?: Date;
  nextRun?: Date;
  status?: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: Date;
}

interface CategoryData<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface UseOrganizationDetailsOptions {
  clientId: number | null;
  enabled?: boolean;
}

interface UseOrganizationDetailsReturn {
  selectedCategory: DrilldownCategory;
  setSelectedCategory: (category: DrilldownCategory) => void;
  alerts: CategoryData<AlertItem>;
  hosts: CategoryData<HostItem>;
  reports: CategoryData<ReportItem>;
  insights: CategoryData<InsightItem>;
  veeam: CategoryData<VeeamJobItem>;
  users: CategoryData<UserItem>;
  refreshCategory: (category: DrilldownCategory) => Promise<void>;
}

const initialCategoryData = <T,>(): CategoryData<T> => ({
  items: [],
  loading: false,
  error: null,
  lastFetched: null,
});

export const useOrganizationDetails = (
  options: UseOrganizationDetailsOptions
): UseOrganizationDetailsReturn => {
  const { clientId, enabled = true } = options;
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [selectedCategory, setSelectedCategory] = useState<DrilldownCategory>(null);
  
  // Detailed data per category
  const [alerts, setAlerts] = useState<CategoryData<AlertItem>>(initialCategoryData);
  const [hosts, setHosts] = useState<CategoryData<HostItem>>(initialCategoryData);
  const [reports, setReports] = useState<CategoryData<ReportItem>>(initialCategoryData);
  const [insights, setInsights] = useState<CategoryData<InsightItem>>(initialCategoryData);
  const [veeam, setVeeam] = useState<CategoryData<VeeamJobItem>>(initialCategoryData);
  const [users, setUsers] = useState<CategoryData<UserItem>>(initialCategoryData);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch alerts details
  const fetchAlerts = useCallback(async () => {
    if (!clientId || !enabled) return;
    
    setAlerts(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authenticatedFetch(ENDPOINTS.alerts, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const rawAlerts = Array.isArray(data) ? data : [];
        const orgAlerts = rawAlerts.filter((a: any) => a.client_id === clientId);
        
        const items: AlertItem[] = orgAlerts.map((a: any) => ({
          id: a.eventid || a.id || String(Math.random()),
          eventid: a.eventid,
          title: a.problem || a.title || a.name || "Unknown Alert",
          message: a.message || a.description,
          severity: a.severity || "info",
          status: a.acknowledged ? "acknowledged" : (a.status || "active"),
          host: a.host || a.hostname,
          timestamp: new Date(a.clock ? a.clock * 1000 : a.created_at || Date.now()),
          acknowledged: a.acknowledged,
        }));
        
        setAlerts({
          items,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
      } else {
        throw new Error("Failed to fetch alerts");
      }
    } catch (err) {
      setAlerts(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch alerts",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Fetch hosts details
  const fetchHosts = useCallback(async () => {
    if (!clientId || !enabled) return;
    
    setHosts(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authenticatedFetch(ENDPOINTS.hosts, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const rawHosts = Array.isArray(data) ? data : [];
        const orgHosts = rawHosts.filter((h: any) => h.client_id === clientId);
        
        const items: HostItem[] = orgHosts.map((h: any) => ({
          hostid: h.hostid || h.id || String(Math.random()),
          host: h.host || h.hostname || "Unknown",
          name: h.name || h.host || "Unknown Host",
          status: typeof h.status === "number" ? h.status : 0,
          available: h.available,
          groups: Array.isArray(h.groups) ? h.groups.map((g: any) => g.name || g) : [],
          lastAccess: h.last_access ? new Date(h.last_access) : undefined,
        }));
        
        setHosts({
          items,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
      } else {
        throw new Error("Failed to fetch hosts");
      }
    } catch (err) {
      setHosts(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch hosts",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Fetch reports details
  const fetchReports = useCallback(async () => {
    if (!clientId || !enabled) return;
    
    setReports(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authenticatedFetch(ENDPOINTS.reports, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const rawReports = Array.isArray(data) ? data : [];
        
        const items: ReportItem[] = rawReports.map((r: any) => ({
          id: r.id || String(Math.random()),
          name: r.name || r.title || "Unnamed Report",
          report_type: r.report_type || "daily",
          status: r.status || "completed",
          created_at: new Date(r.created_at || Date.now()),
          client_id: r.client_id,
        }));
        
        setReports({
          items,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
      } else {
        throw new Error("Failed to fetch reports");
      }
    } catch (err) {
      setReports(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch reports",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Fetch insights details
  const fetchInsights = useCallback(async () => {
    if (!clientId || !enabled) return;
    
    setInsights(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authenticatedFetch(ENDPOINTS.insights, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const rawInsights = Array.isArray(data) ? data : [];
        const orgInsights = rawInsights.filter((i: any) => i.client_id === clientId);
        
        const items: InsightItem[] = orgInsights.map((i: any) => ({
          id: i.id || String(Math.random()),
          type: i.type || "insight",
          title: i.title || i.name || "AI Insight",
          summary: i.summary || i.description || i.message || "",
          severity: i.severity,
          timestamp: new Date(i.created_at || i.timestamp || Date.now()),
          client_id: i.client_id,
        }));
        
        setInsights({
          items,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
      } else {
        throw new Error("Failed to fetch insights");
      }
    } catch (err) {
      setInsights(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch insights",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Fetch veeam jobs details
  const fetchVeeam = useCallback(async () => {
    if (!clientId || !enabled) return;
    
    setVeeam(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authenticatedFetch(ENDPOINTS.veeam, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const data = await response.json();
        const rawJobs = Array.isArray(data) ? data : [];
        
        const items: VeeamJobItem[] = rawJobs.map((j: any) => ({
          id: j.id || j.jobId || String(Math.random()),
          name: j.name || j.jobName || "Unnamed Job",
          type: j.type || j.jobType,
          severity: j.severity || j.status || "unknown",
          lastRun: j.lastRun ? new Date(j.lastRun) : undefined,
          nextRun: j.nextRun ? new Date(j.nextRun) : undefined,
          status: j.status,
        }));
        
        setVeeam({
          items,
          loading: false,
          error: null,
          lastFetched: new Date(),
        });
      } else {
        throw new Error("Failed to fetch Veeam jobs");
      }
    } catch (err) {
      setVeeam(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch Veeam jobs",
      }));
    }
  }, [clientId, enabled, authenticatedFetch]);

  // Fetch users (mock since no endpoint exists - would need keycloak integration)
  const fetchUsers = useCallback(async () => {
    if (!clientId || !enabled) return;
    
    setUsers(prev => ({ ...prev, loading: true, error: null }));
    
    // Simulate user data since no users endpoint exists
    // In production, this would call a keycloak or users endpoint
    setTimeout(() => {
      const mockUsers: UserItem[] = [
        { id: "1", name: "Admin User", email: "admin@org.com", role: "admin", status: "active" },
        { id: "2", name: "Power User", email: "power@org.com", role: "user", status: "active" },
        { id: "3", name: "Viewer", email: "viewer@org.com", role: "viewer", status: "inactive" },
      ];
      
      setUsers({
        items: mockUsers,
        loading: false,
        error: null,
        lastFetched: new Date(),
      });
    }, 500);
  }, [clientId, enabled]);

  // Refresh a specific category
  const refreshCategory = useCallback(async (category: DrilldownCategory) => {
    if (!category) return;
    
    switch (category) {
      case "alerts": await fetchAlerts(); break;
      case "hosts": await fetchHosts(); break;
      case "reports": await fetchReports(); break;
      case "insights": await fetchInsights(); break;
      case "veeam": await fetchVeeam(); break;
      case "users": await fetchUsers(); break;
    }
  }, [fetchAlerts, fetchHosts, fetchReports, fetchInsights, fetchVeeam, fetchUsers]);

  // Lazy load data when category changes
  useEffect(() => {
    if (!selectedCategory || !clientId || !enabled) return;
    
    // Check if data needs to be fetched (not already loaded or stale)
    const shouldFetch = (data: CategoryData<any>) => 
      !data.lastFetched || data.items.length === 0;
    
    switch (selectedCategory) {
      case "alerts":
        if (shouldFetch(alerts)) fetchAlerts();
        break;
      case "hosts":
        if (shouldFetch(hosts)) fetchHosts();
        break;
      case "reports":
        if (shouldFetch(reports)) fetchReports();
        break;
      case "insights":
        if (shouldFetch(insights)) fetchInsights();
        break;
      case "veeam":
        if (shouldFetch(veeam)) fetchVeeam();
        break;
      case "users":
        if (shouldFetch(users)) fetchUsers();
        break;
    }
  }, [selectedCategory, clientId, enabled]);

  // Reset data when org changes
  useEffect(() => {
    setAlerts(initialCategoryData());
    setHosts(initialCategoryData());
    setReports(initialCategoryData());
    setInsights(initialCategoryData());
    setVeeam(initialCategoryData());
    setUsers(initialCategoryData());
  }, [clientId]);

  return {
    selectedCategory,
    setSelectedCategory,
    alerts,
    hosts,
    reports,
    insights,
    veeam,
    users,
    refreshCategory,
  };
};

export default useOrganizationDetails;
