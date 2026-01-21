import { Route, Switch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { api } from './lib/api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CallsPage from './pages/CallsPage';
import SettingsPage from './pages/SettingsPage';
import AssistantPage from './pages/AssistantPage';
import Layout from './components/Layout';

export default function App() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: api.user.get,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/calls" component={CallsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/assistant" component={AssistantPage} />
        <Route>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="text-muted-foreground mt-2">Page not found</p>
            </div>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}
