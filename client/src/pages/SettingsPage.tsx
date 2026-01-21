import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get,
  });

  const updateMutation = useMutation({
    mutationFn: api.settings.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  const handleToggleScreening = () => {
    updateMutation.mutate({ screeningEnabled: !settings?.screeningEnabled });
  };

  const handleProtectionLevel = (level: string) => {
    updateMutation.mutate({ protectionLevel: level });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your call protection preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Call Screening</CardTitle>
            <CardDescription>
              Enable or disable AI-powered call screening
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">AI Call Screening</div>
                <div className="text-sm text-muted-foreground">
                  Screen incoming calls with AI assistant
                </div>
              </div>
              <Button
                variant={settings?.screeningEnabled ? 'default' : 'outline'}
                onClick={handleToggleScreening}
                disabled={updateMutation.isPending}
              >
                {settings?.screeningEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protection Level</CardTitle>
            <CardDescription>
              Choose how aggressively to screen calls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  onClick={() => handleProtectionLevel(level)}
                  disabled={updateMutation.isPending}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    settings?.protectionLevel === level
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield
                      className={`h-5 w-5 ${
                        settings?.protectionLevel === level
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <div>
                      <div className="font-medium capitalize">{level} Protection</div>
                      <div className="text-sm text-muted-foreground">
                        {level === 'low' && 'Only block obvious spam and scams'}
                        {level === 'medium' && 'Balanced protection with moderate filtering'}
                        {level === 'high' && 'Maximum protection, may block legitimate calls'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto-Block Threshold</CardTitle>
            <CardDescription>
              Automatically block calls with risk score above this value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Threshold</span>
                <span className="text-2xl font-bold text-primary">
                  {settings?.autoBlockThreshold}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[60, 70, 80].map((threshold) => (
                  <Button
                    key={threshold}
                    variant={settings?.autoBlockThreshold === threshold ? 'default' : 'outline'}
                    onClick={() => updateMutation.mutate({ autoBlockThreshold: threshold })}
                    disabled={updateMutation.isPending}
                  >
                    {threshold}%
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
