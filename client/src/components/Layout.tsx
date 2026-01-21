import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, Home, Phone, Settings, MessageSquare, LogOut } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from './ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Calls', href: '/calls', icon: Phone },
  { name: 'Assistant', href: '/assistant', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <aside className="w-64 border-r border-border bg-card">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center gap-3 border-b border-border px-6">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-display font-bold">CallShield</span>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;

                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border p-4">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
