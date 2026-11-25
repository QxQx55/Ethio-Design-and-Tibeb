/**
 * Local API client.
 *
 * Mirrors the small slice of the Supabase JS client that the storefront uses,
 * but talks to the bundled Node/SQLite backend in `backend/index.js`. This keeps
 * every existing page and component untouched while giving the app a real,
 * persistent backend (accounts, catalog, orders, inventory, uploads).
 */

export type LocalAuthEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'USER_UPDATED'
  | 'TOKEN_REFRESHED';

export interface LocalApiErrorShape {
  message: string;
  status: number;
  code: string;
}

export interface LocalSession {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    created_at: string;
    user_metadata?: { name?: string | null; role?: string | null };
  };
}

type ApiResult<T> = Promise<{ data: T | null; error: LocalApiErrorShape | null }>;

const TOKEN_KEY = 'ethio-design-and-tibeb.auth.token';
const API_BASE = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const REQUEST_TIMEOUT = 15000;
const REALTIME_INTERVAL = 10000;

const safeStorage = {
  get(key: string) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* storage can be blocked in private mode */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export class LocalApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 0, code = '') {
    super(message);
    this.name = 'LocalApiError';
    this.status = status;
    this.code = code || (status === 0 ? 'network_error' : `http_${status}`);
  }
}

export const toErrorShape = (error: unknown): LocalApiErrorShape => {
  if (error instanceof LocalApiError) {
    return { message: error.message, status: error.status, code: error.code };
  }
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Something went wrong. Please try again.';
  return { message, status: 0, code: 'unknown_error' };
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const token = safeStorage.get(TOKEN_KEY);
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'AbortError';
    throw new LocalApiError(
      timedOut
        ? 'The store server took too long to respond. Please try again.'
        : 'Unable to reach the store server. Make sure it is running and try again.',
      0,
    );
  } finally {
    window.clearTimeout(timer);
  }

  const text = await response.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new LocalApiError(
      payload?.error?.message || `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return payload as T;
}

type AuthListener = (event: LocalAuthEvent, session: LocalSession | null) => void;
const authListeners = new Set<AuthListener>();

const emitAuth = (event: LocalAuthEvent, session: LocalSession | null) => {
  authListeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch {
      /* a broken listener must not break auth */
    }
  });
};

const persistSession = (session: LocalSession | null) => {
  if (session?.access_token) safeStorage.set(TOKEN_KEY, session.access_token);
  else safeStorage.remove(TOKEN_KEY);
};

const auth = {
  async signUp(input: { email: string; password: string; options?: { data?: Record<string, unknown> } }) {
    const data = input.options?.data || {};
    try {
      const payload = await api<any>('/api/auth/signup', {
        method: 'POST',
        auth: false,
        body: {
          email: input.email,
          password: input.password,
          name: data.name,
          role: data.role,
        },
      });
      persistSession(payload.session);
      emitAuth('SIGNED_IN', payload.session);
      return { data: { user: payload.user, session: payload.session }, error: null };
    } catch (error) {
      return { data: { user: null, session: null }, error: toErrorShape(error) };
    }
  },

  async signInWithPassword(input: { email: string; password: string }) {
    try {
      const payload = await api<any>('/api/auth/signin', {
        method: 'POST',
        auth: false,
        body: input,
      });
      persistSession(payload.session);
      emitAuth('SIGNED_IN', payload.session);
      return { data: { user: payload.user, session: payload.session }, error: null };
    } catch (error) {
      return { data: { user: null, session: null }, error: toErrorShape(error) };
    }
  },

  async getSession(): ApiResult<{ session: LocalSession | null }> {
    if (!safeStorage.get(TOKEN_KEY)) {
      return { data: { session: null }, error: null };
    }

    try {
      const payload = await api<any>('/api/auth/session');
      persistSession(payload.session);
      return { data: { session: payload.session }, error: null };
    } catch (error) {
      const shape = toErrorShape(error);
      if (shape.status === 401) {
        safeStorage.remove(TOKEN_KEY);
        return { data: { session: null }, error: null };
      }
      return { data: { session: null }, error: shape };
    }
  },

  async getUser(): ApiResult<{ user: LocalSession['user'] | null }> {
    try {
      const { data, error } = await auth.getSession();
      if (error) return { data: { user: null }, error };
      return { data: { user: data?.session?.user ?? null }, error: null };
    } catch (error) {
      return { data: { user: null }, error: toErrorShape(error) };
    }
  },

  async signOut() {
    try {
      await api('/api/auth/signout', { method: 'POST' });
    } catch {
      /* signing out locally should always succeed */
    }
    persistSession(null);
    emitAuth('SIGNED_OUT', null);
    return { error: null };
  },

  async resend(input: { type?: string; email?: string }) {
    try {
      await api('/api/auth/resend', { method: 'POST', body: input });
      return { data: {}, error: null };
    } catch (error) {
      return { data: null, error: toErrorShape(error) };
    }
  },

  onAuthStateChange(listener: AuthListener) {
    authListeners.add(listener);
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(listener),
        },
      },
    };
  },
};

type Filter = [string, string, unknown];

const buildQuery = (filters: Filter[], orders: string[], limit: number | null) => {
  const params = new URLSearchParams();
  if (filters.length) params.set('filters', JSON.stringify(filters));
  if (orders.length) params.set('order', orders.join(','));
  if (limit !== null) params.set('limit', String(limit));
  const query = params.toString();
  return query ? `?${query}` : '';
};

class QueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: LocalApiErrorShape | null }> {
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: unknown = undefined;
  private filters: Filter[] = [];
  private orders: string[] = [];
  private limitCount: number | null = null;
  private singleMode: 'single' | 'maybe' | null = null;
  private wantsRows = false;

  constructor(private readonly table: string) {}

  select(_columns = '*') {
    this.wantsRows = true;
    return this;
  }

  insert(payload: unknown) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: unknown) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push([column, 'eq', value]);
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push([column, 'neq', value]);
    return this;
  }

  gt(column: string, value: unknown) {
    this.filters.push([column, 'gt', value]);
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push([column, 'gte', value]);
    return this;
  }

  lt(column: string, value: unknown) {
    this.filters.push([column, 'lt', value]);
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push([column, 'lte', value]);
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push([column, 'in', values]);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.orders.push(`${column}.${options.ascending === false ? 'desc' : 'asc'}`);
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleMode = 'single';
    return this;
  }

  maybeSingle() {
    this.singleMode = 'maybe';
    return this;
  }

  private shape(rows: any[]): { data: T | null; error: LocalApiErrorShape | null } {
    if (this.singleMode === 'single') {
      if (!rows.length) {
        return {
          data: null,
          error: { message: 'No matching record was found.', status: 406, code: 'PGRST116' },
        };
      }
      return { data: rows[0] as T, error: null };
    }
    if (this.singleMode === 'maybe') {
      return { data: (rows[0] ?? null) as T, error: null };
    }
    return { data: rows as unknown as T, error: null };
  }

  private async execute(): Promise<{ data: T | null; error: LocalApiErrorShape | null }> {
    const endpoint = `/api/db/${encodeURIComponent(this.table)}${buildQuery(this.filters, this.orders, this.limitCount)}`;

    try {
      if (this.action === 'select') {
        const rows = await api<any[]>(endpoint);
        return this.shape(Array.isArray(rows) ? rows : []);
      }

      if (this.action === 'insert') {
        const rows = await api<any[]>(`/api/db/${encodeURIComponent(this.table)}`, {
          method: 'POST',
          body: this.payload,
        });
        if (!this.wantsRows) return { data: null, error: null };
        return this.shape(Array.isArray(rows) ? rows : rows ? [rows] : []);
      }

      if (this.action === 'update') {
        const rows = await api<any[]>(endpoint, { method: 'PATCH', body: this.payload });
        if (!this.wantsRows) return { data: null, error: null };
        return this.shape(Array.isArray(rows) ? rows : rows ? [rows] : []);
      }

      await api<unknown>(endpoint, { method: 'DELETE' });
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: toErrorShape(error) };
    }
  }

  then<TResult1 = { data: T | null; error: LocalApiErrorShape | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: LocalApiErrorShape | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class LocalChannel {
  private table: string | null = null;
  private callback: (() => void) | null = null;
  private signature: string | null = null;
  private timer: number | null = null;

  constructor(public readonly name: string) {}

  on(_type: string, filter: { table?: string }, callback: () => void) {
    this.table = filter?.table || null;
    this.callback = callback;
    return this;
  }

  subscribe() {
    if (!this.table || this.timer !== null) return this;

    const table = this.table;
    const poll = async () => {
      try {
        const rows = await api<any[]>(`/api/db/${encodeURIComponent(table)}?limit=200`);
        const next = JSON.stringify(rows);
        if (this.signature !== null && next !== this.signature) {
          try {
            this.callback?.();
          } catch {
            /* ignore component errors */
          }
        }
        this.signature = next;
      } catch {
        /* stay quiet while the server is unavailable; the UI already handles it */
      }
    };

    void poll();
    this.timer = window.setInterval(poll, REALTIME_INTERVAL);
    return this;
  }

  unsubscribe() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}

const channels = new Set<LocalChannel>();

const storage = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File) {
        try {
          const bytes = new Uint8Array(await file.arrayBuffer());
          let binary = '';
          const chunkSize = 0x8000;
          for (let index = 0; index < bytes.length; index += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
          }

          await api('/api/storage/upload', {
            method: 'POST',
            body: { bucket, path, dataBase64: window.btoa(binary) },
          });

          return { data: { path }, error: null };
        } catch (error) {
          return { data: null, error: toErrorShape(error) };
        }
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: `${API_BASE}/uploads/${bucket}/${path}` } };
      },
    };
  },
};

export const localClient = {
  auth,
  from<T = any>(table: string) {
    return new QueryBuilder<T>(table);
  },
  storage,
  channel(name: string) {
    const channel = new LocalChannel(name || `local-${Math.random().toString(36).slice(2, 10)}`);
    channels.add(channel);
    return channel;
  },
  removeChannel(channel: LocalChannel) {
    try {
      channel.unsubscribe();
    } finally {
      channels.delete(channel);
    }
    return Promise.resolve('ok');
  },
};

export type LocalChannelType = LocalChannel;
export const isLocalBackend = true;
