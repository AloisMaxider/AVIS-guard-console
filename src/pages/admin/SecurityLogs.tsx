import { useState } from "react";
import { Shield, Search, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AppLayout from "@/components/layout/AppLayout";

const SecurityLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { label: "Total Events", value: "12,458", icon: Shield, color: "text-primary" },
    { label: "Successful Logins", value: "11,842", icon: CheckCircle, color: "text-success" },
    { label: "Failed Attempts", value: "342", icon: XCircle, color: "text-error" },
    { label: "Security Alerts", value: "18", icon: AlertTriangle, color: "text-warning" },
  ];

  const securityEvents = [
    { 
      timestamp: "2025-11-16 14:32:18",
      event: "Failed Login Attempt",
      user: "admin@techcorp.com",
      ip: "192.168.1.42",
      severity: "high",
      details: "Multiple failed password attempts detected"
    },
    { 
      timestamp: "2025-11-16 14:28:05",
      event: "User Role Changed",
      user: "sarah.chen@techcorp.com",
      ip: "10.0.1.15",
      severity: "medium",
      details: "User promoted to Admin role"
    },
    { 
      timestamp: "2025-11-16 14:15:42",
      event: "Successful Login",
      user: "mike.johnson@techcorp.com",
      ip: "172.16.0.8",
      severity: "low",
      details: "2FA verified successfully"
    },
    { 
      timestamp: "2025-11-16 13:58:22",
      event: "API Key Generated",
      user: "alex.kim@techcorp.com",
      ip: "10.0.1.42",
      severity: "medium",
      details: "New API key created for production access"
    },
    { 
      timestamp: "2025-11-16 13:45:11",
      event: "Suspicious Activity",
      user: "unknown",
      ip: "203.0.113.42",
      severity: "high",
      details: "Rate limit exceeded - possible brute force attack"
    },
  ];

  const filteredEvents = securityEvents.filter(event =>
    event.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.ip.includes(searchQuery)
  );

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Security Logs</h1>
            <p className="text-muted-foreground">Monitor and audit security events</p>
          </div>
          <Badge variant="outline" className="neon-border">
            <Shield className="w-4 h-4 mr-2" />
            Real-time Monitoring
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card border-primary/20 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-8 h-8 ${stat.color} glow-primary`} />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search security events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>
        </div>

        {/* Security Events Table */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>Audit trail of all security-related activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event, index) => (
                  <TableRow key={index} className="border-border hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {event.timestamp}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{event.event}</TableCell>
                    <TableCell>{event.user}</TableCell>
                    <TableCell className="font-mono text-sm">{event.ip}</TableCell>
                    <TableCell>
                      <Badge variant={
                        event.severity === 'high' 
                          ? 'destructive' 
                          : event.severity === 'medium' 
                          ? 'default' 
                          : 'outline'
                      }>
                        {event.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {event.details}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SecurityLogs;
