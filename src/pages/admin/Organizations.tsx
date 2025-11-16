import { useState } from "react";
import { Building2, Search, MoreVertical, Users, DollarSign, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppLayout from "@/components/layout/AppLayout";

const Organizations = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const organizations = [
    { id: 1, name: "TechCorp Global", users: 842, plan: "Enterprise", revenue: 12400, health: 99.8, status: "Active" },
    { id: 2, name: "FinServe Inc", users: 523, plan: "Business", revenue: 8900, health: 99.5, status: "Active" },
    { id: 3, name: "DataFlow Systems", users: 412, plan: "Enterprise", revenue: 7200, health: 98.9, status: "Active" },
    { id: 4, name: "CloudNet Solutions", users: 358, plan: "Business", revenue: 6100, health: 99.2, status: "Active" },
    { id: 5, name: "SecureOps Ltd", users: 289, plan: "Professional", revenue: 4500, health: 97.8, status: "Warning" },
  ];

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Organizations</h1>
            <p className="text-muted-foreground">Multi-tenant organization management</p>
          </div>
          <Button className="neon-button">
            <Plus className="w-4 h-4 mr-2" />
            New Organization
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>
        </div>

        {/* Organizations Table */}
        <div className="glass-card border-primary/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Organization</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.map((org) => (
                <TableRow key={org.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      {org.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {org.users}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{org.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-accent" />
                      ${org.revenue.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${org.health > 99 ? 'text-success' : 'text-warning'}`} />
                      {org.health}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={org.status === 'Active' ? 'default' : 'destructive'}>
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-primary/20">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage Users</DropdownMenuItem>
                        <DropdownMenuItem>Billing Settings</DropdownMenuItem>
                        <DropdownMenuItem>Impersonate</DropdownMenuItem>
                        <DropdownMenuItem className="text-error">Suspend</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Organizations;
