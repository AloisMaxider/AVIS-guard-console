import { CreditCard, Download, TrendingUp, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";

const Billing = () => {
  const currentPlan = {
    name: "Enterprise",
    price: 2499,
    billing: "Monthly",
    nextBilling: "Dec 15, 2025",
    features: [
      "Unlimited users",
      "Advanced AI features",
      "Priority support",
      "Custom integrations",
      "99.99% SLA",
    ],
  };

  const usage = [
    { metric: "Users", current: 48, limit: "Unlimited", percentage: 0 },
    { metric: "API Calls", current: 842500, limit: 1000000, percentage: 84 },
    { metric: "Storage", current: 245, limit: 500, percentage: 49, unit: "GB" },
    { metric: "AI Queries", current: 12400, limit: 25000, percentage: 50 },
  ];

  const invoices = [
    { id: "INV-2025-001", date: "Nov 15, 2025", amount: 2499, status: "Paid" },
    { id: "INV-2025-002", date: "Oct 15, 2025", amount: 2499, status: "Paid" },
    { id: "INV-2025-003", date: "Sep 15, 2025", amount: 2499, status: "Paid" },
  ];

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription and billing details</p>
          </div>
          <Button className="neon-button">
            <CreditCard className="w-4 h-4 mr-2" />
            Update Payment Method
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Current Plan */}
          <Card className="glass-card border-primary/20 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                <Badge variant="default" className="neon-border">
                  {currentPlan.name}
                </Badge>
              </CardTitle>
              <CardDescription>Your subscription details and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold">${currentPlan.price}</span>
                <span className="text-muted-foreground">/ {currentPlan.billing.toLowerCase()}</span>
              </div>
              <div className="space-y-3 mb-6">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 p-4 glass-card border border-border rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm">
                  Next billing date: <strong>{currentPlan.nextBilling}</strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-accent glow-primary" />
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div className="text-2xl font-bold mb-1">$7,497</div>
                <div className="text-sm text-muted-foreground">Last 3 months</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-8 h-8 text-primary glow-primary" />
                </div>
                <div className="text-sm font-medium mb-1">Payment Method</div>
                <div className="text-sm text-muted-foreground">•••• 4242</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Metrics */}
        <Card className="glass-card border-primary/20 mb-8">
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>Monitor your resource consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {usage.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.metric}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.current.toLocaleString()} {item.unit || ''} 
                      {item.limit !== "Unlimited" && ` / ${item.limit.toLocaleString()} ${item.unit || ''}`}
                    </span>
                  </div>
                  {item.limit !== "Unlimited" && (
                    <Progress value={item.percentage} className="h-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>Download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 glass-card border border-border rounded-lg hover-lift"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">${invoice.amount}</p>
                      <Badge variant="outline" className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
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

export default Billing;
