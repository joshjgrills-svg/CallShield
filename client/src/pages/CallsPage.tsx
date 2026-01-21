import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatPhoneNumber, getRiskColor, getCategoryBadgeColor } from '@/lib/utils';

export default function CallsPage() {
  const [showSimulator, setShowSimulator] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callerName, setCallerName] = useState('');
  const [message, setMessage] = useState('');

  const queryClient = useQueryClient();

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: api.calls.list,
  });

  const simulateMutation = useMutation({
    mutationFn: api.calls.simulate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      setShowSimulator(false);
      setPhoneNumber('');
      setCallerName('');
      setMessage('');
    },
  });

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    simulateMutation.mutate({ phoneNumber, callerName, message });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading calls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Call History</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your incoming call history
          </p>
        </div>
        <Button onClick={() => setShowSimulator(!showSimulator)}>
          <Plus className="mr-2 h-4 w-4" />
          Simulate Call
        </Button>
      </div>

      {showSimulator && (
        <Card>
          <CardHeader>
            <CardTitle>Simulate Incoming Call</CardTitle>
            <CardDescription>Test the call screening system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Caller Name (Optional)</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Input
                  type="text"
                  placeholder="Hello, I'm calling about your car's extended warranty..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={simulateMutation.isPending}>
                  {simulateMutation.isPending ? 'Simulating...' : 'Simulate Call'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSimulator(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Calls</CardTitle>
          <CardDescription>Complete history of screened calls</CardDescription>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No calls yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Use the "Simulate Call" button to test the system
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call) => (
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
                      <div className="font-medium">{formatPhoneNumber(call.phoneNumber)}</div>
                      {call.callerName && (
                        <div className="text-sm text-muted-foreground">{call.callerName}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(call.timestamp)}
                        {call.duration && ` • ${call.duration}s`}
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
                    {call.blocked && (
                      <div className="text-xs font-medium text-red-500 px-2 py-1 bg-red-500/10 rounded border border-red-500/20">
                        BLOCKED
                      </div>
                    )}
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
