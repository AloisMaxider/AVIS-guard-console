import { Building2, Users, Activity, DollarSign, Shield, AlertTriangle, Database, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";

const SuperAdmin = () => {
  const globalStats = [
    { label: "Total Organizations", value: "247", change: "+18", icon: Building2, color: "text-primary" },
    { label: "Active Users", value: "12,458", change: "+342", icon: Users, color: "text-success" },
    { label: "Monthly Revenue", value: "$184K", change: "+12%", icon: DollarSign, color: "text-accent" },
    { label: "System Health", value: "98.5%", change: "+0.3%", icon: Activity, color: "text-success" },
  ];

  const topOrganizations = [
    { name: "TechCorp Global", users: 842, revenue: "$12,400", health: 99.8, tier: "Enterprise" },
    { name: "FinServe Inc", users: 523, revenue: "$8,900", health: 99.5, tier: "Business" },
    { name: "DataFlow Systems", users: 412, revenue: "$7,200", health: 98.9, tier: "Enterprise" },
    { name: "CloudNet Solutions", users: 358, revenue: "$6,100", health: 99.2, tier: "Business" },
  ];

  const systemAlerts = [
    { severity: "high", message: "Database latency spike in EU-WEST region", time: "5 min ago" },
    { severity: "medium", message: "3 organizations approaching usage limits", time: "1 hour ago" },
    { severity: "low", message: "Scheduled maintenance in 24 hours", time: "2 hours ago" },
  ];

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Global system management and multi-tenant oversight</p>
          </div>
          <Badge variant="outline" className="neon-border bg-accent/10">
            <Shield className="w-4 h-4 mr-2" />
            Super Admin
          </Badge>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {globalStats.map((stat, index) => (
            <Card key={index} className="glass-card border-primary/20 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color} glow-primary`} />
                  <Badge variant="default">{stat.change}</Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/organizations">
            <Button className="w-full neon-button h-auto py-6 flex-col gap-2">
              <Building2 className="w-6 h-6" />
              <span>Organizations</span>
            </Button>
          </Link>
          <Link to="/admin/security-logs">
            <Button className="w-full neon-button h-auto py-6 flex-col gap-2">
              <Shield className="w-6 h-6" />
              <span>Security Logs</span>
            </Button>
          </Link>
          <Button className="w-full neon-button h-auto py-6 flex-col gap-2">
            <Database className="w-6 h-6" />
            <span>System Metrics</span>
          </Button>
          <Button className="w-full neon-button h-auto py-6 flex-col gap-2">
            <Zap className="w-6 h-6" />
            <span>Feature Flags</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Organizations */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Top Organizations</CardTitle>
              <CardDescription>Highest performing tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topOrganizations.map((org, index) => (
                  <div
                    key={index}
                    className="p-4 glass-card border border-border rounded-lg hover-lift"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{org.name}</h4>
                      <Badge variant="outline">{org.tier}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Users</p>
                        <p className="font-medium">{org.users}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">{org.revenue}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Health</p>
                        <p className="font-medium text-success">{org.health}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                System Alerts
              </CardTitle>
              <CardDescription>Critical notifications requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 glass-card border rounded-lg ${
                      alert.severity === 'high' 
                        ? 'border-error' 
                        : alert.severity === 'medium' 
                        ? 'border-warning' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            alert.severity === 'high' 
                              ? 'destructive' 
                              : alert.severity === 'medium' 
                              ? 'default' 
                              : 'outline'
                          }>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm mb-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SuperAdmin;
