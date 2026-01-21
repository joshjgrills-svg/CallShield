import { useQuery } from '@tanstack/react-query';
import { Phone, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, getRiskColor, getCategoryBadgeColor } from '@/lib/utils';

export default function DashboardPage() {
  const { data: calls = [], isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: api.calls.list,
  });

  const blockedCalls = calls.filter((call) => call.blocked);
  const highRiskCalls = calls.filter((call) => call.riskScore >= 70);
  const avgRiskScore = calls.length
    ? Math.round(calls.reduce((sum, call) => sum + call.riskScore, 0) / calls.length)
    : 0;

  const stats = [
    { name: 'Total Calls', value: calls.length, icon: Phone, color: 'text-blue-500' },
    { name: 'Blocked Calls', value: blockedCalls.length, icon: Shield, color: 'text-green-500' },
    { name: 'High Risk', value: highRiskCalls.length, icon: AlertTriangle, color: 'text-red-500' },
    { name: 'Avg Risk Score', value: avgRiskScore, icon: TrendingUp, color: 'text-orange-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Your call protection overview and recent activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>Your latest incoming call activity</CardDescription>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No calls yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Calls will appear here once they are received
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {calls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        call.blocked ? 'bg-red-500/10' : 'bg-green-500/10'
                      }`}
                    >
                      <Phone
                        className={`h-5 w-5 ${call.blocked ? 'text-red-500' : 'text-green-500'}`}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{call.phoneNumber}</div>
                      {call.callerName && (
                        <div className="text-sm text-muted-foreground">{call.callerName}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(call.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-sm font-medium px-3 py-1 rounded-full border ${getCategoryBadgeColor(call.category)}`}
                    >
                      {call.category}
                    </div>
                    <div className={`text-sm font-bold ${getRiskColor(call.riskScore)}`}>
                      {call.riskScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
