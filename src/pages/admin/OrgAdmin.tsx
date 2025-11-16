import { Users, DollarSign, Bell, Settings, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";

const OrgAdmin = () => {
  const stats = [
    { label: "Total Users", value: "48", change: "+12%", icon: Users, color: "text-primary" },
    { label: "Monthly Cost", value: "$2,499", change: "+8%", icon: DollarSign, color: "text-accent" },
    { label: "Active Alerts", value: "12", change: "-5%", icon: Bell, color: "text-warning" },
    { label: "Uptime SLA", value: "99.97%", change: "+0.02%", icon: TrendingUp, color: "text-success" },
  ];

  const recentActivities = [
    { user: "Sarah Chen", action: "Created new user", role: "Admin", time: "2 minutes ago" },
    { user: "Mike Johnson", action: "Updated billing info", role: "Owner", time: "1 hour ago" },
    { user: "Alex Kim", action: "Modified alert rules", role: "Admin", time: "3 hours ago" },
    { user: "Emma Wilson", action: "Enabled 2FA", role: "User", time: "5 hours ago" },
  ];

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Organization Admin</h1>
            <p className="text-muted-foreground">Manage users, billing, and organization settings</p>
          </div>
          <Badge variant="outline" className="neon-border">
            <Shield className="w-4 h-4 mr-2" />
            Org Admin Role
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card border-primary/20 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color} glow-primary`} />
                  <Badge variant={stat.change.startsWith('+') ? "default" : "destructive"}>
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/users">
            <Button className="w-full neon-button h-auto py-6 flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Manage Users</span>
            </Button>
          </Link>
          <Link to="/admin/billing">
            <Button className="w-full neon-button h-auto py-6 flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              <span>Billing & Plans</span>
            </Button>
          </Link>
          <Link to="/admin/alerts">
            <Button className="w-full neon-button h-auto py-6 flex-col gap-2">
              <Bell className="w-6 h-6" />
              <span>Alert Config</span>
            </Button>
          </Link>
          <Button className="w-full neon-button h-auto py-6 flex-col gap-2">
            <Settings className="w-6 h-6" />
            <span>Settings</span>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest administrative actions in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 glass-card border border-border rounded-lg hover-lift"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {activity.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{activity.role}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OrgAdmin;
