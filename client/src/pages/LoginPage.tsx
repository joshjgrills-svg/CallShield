import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      loginMutation.mutate(username.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-display">Welcome to CallShield</CardTitle>
            <CardDescription className="mt-2">
              AI-powered call protection to keep you safe from spam and scams
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loginMutation.isPending}
                autoFocus
              />
            </div>

            {loginMutation.isError && (
              <p className="text-sm text-destructive">
                Failed to login. Please try again.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!username.trim() || loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Get Started'}
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            This is a demo app. Enter any username to continue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
