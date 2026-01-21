async function fetchAPI(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (username: string) =>
      fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password: 'demo' }),
      }),
    logout: () =>
      fetchAPI('/api/auth/logout', { method: 'POST' }),
  },

  user: {
    get: () => fetchAPI('/api/user'),
  },

  calls: {
    list: () => fetchAPI('/api/calls'),
    get: (id: number) => fetchAPI(`/api/calls/${id}`),
    simulate: (data: { phoneNumber: string; callerName?: string; message: string }) =>
      fetchAPI('/api/calls/simulate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  blockedRules: {
    list: () => fetchAPI('/api/blocked-rules'),
    add: (data: { phoneNumber: string; ruleName: string; isWildcard?: boolean }) =>
      fetchAPI('/api/blocked-rules', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI(`/api/blocked-rules/${id}`, { method: 'DELETE' }),
  },

  settings: {
    get: () => fetchAPI('/api/settings'),
    update: (data: any) =>
      fetchAPI('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  conversations: {
    list: () => fetchAPI('/api/conversations'),
    create: (title?: string) =>
      fetchAPI('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    getMessages: (id: number) =>
      fetchAPI(`/api/conversations/${id}/messages`),
    sendMessage: (id: number, content: string) =>
      fetchAPI(`/api/conversations/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },
};
