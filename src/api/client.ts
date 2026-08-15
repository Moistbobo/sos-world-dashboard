import type {
  HealthResponse,
  MeResponse,
  MetaResponse,
  PaginatedWorlds,
  TagsResponse,
  World,
} from '../types';

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (typeof url === 'string' && url.trim()) {
    return url.trim().replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

function getToken(): string {
  const token = import.meta.env.VITE_API_BEARER_TOKEN;
  return typeof token === 'string' ? token : '';
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(getUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return request('/api/health');
}

export async function fetchWorlds(params?: {
  limit?: number;
  offset?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  highPriority?: boolean;
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  platform?: string[];
  worldId?: string[];
  dayRange?: number;
}): Promise<PaginatedWorlds> {
  const qs = new URLSearchParams();
  if (params?.limit !== undefined) qs.set('limit', String(params.limit));
  if (params?.offset !== undefined) qs.set('offset', String(params.offset));
  if (params?.search?.trim()) qs.set('search', params.search.trim());
  if (params?.minCapacity !== undefined) qs.set('minCapacity', String(params.minCapacity));
  if (params?.maxCapacity !== undefined) qs.set('maxCapacity', String(params.maxCapacity));
  if (params?.highPriority) qs.set('highPriority', 'true');
  if (params?.tag?.length) {
    for (const t of params.tag) qs.append('tag', t);
  }
  if (params?.quality?.length) {
    for (const q of params.quality) qs.append('quality', q);
  }
  if (params?.platform?.length) {
    for (const p of params.platform) qs.append('platform', p);
  }
  if (params?.worldId?.length) {
    for (const id of params.worldId) qs.append('worldId', id);
  }
  if (params?.dayRange !== undefined) {
    qs.set('dayRange', String(params.dayRange));
  }
  const query = qs.toString();
  return request(`/api/worlds${query ? `?${query}` : ''}`);
}

export async function fetchWorldsByIds(worldIds: string[]): Promise<World[]> {
  if (worldIds.length === 0) return [];
  const params = new URLSearchParams();
  for (const id of worldIds) params.append('worldId', id);
  const res = await request<{ worlds: World[] } | World[]>(`/api/worlds?${params.toString()}`);
  if (Array.isArray(res)) return res;
  return res.worlds ?? [];
}

export async function fetchWorld(worldId: string): Promise<World> {
  return request(`/api/worlds/${encodeURIComponent(worldId)}`);
}

export async function fetchMe(): Promise<MeResponse> {
  return request('/api/me');
}

export async function fetchTags(): Promise<TagsResponse> {
  return request('/api/tags');
}

export async function fetchMeta(): Promise<MetaResponse> {
  return request('/api/meta');
}
