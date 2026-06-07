import type { HealthResponse, PaginatedWorlds, TagsResponse, World } from '../types';

const STORAGE_KEY = 'sosworld_api_config';

export interface ApiConfig {
  baseUrl: string;
  token: string;
}

export function getConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ApiConfig;
  } catch {
    // ignore
  }
  return {
    baseUrl: 'http://localhost:3000',
    token: '',
  };
}

export function setConfig(config: ApiConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function getAuthHeaders(): Record<string, string> {
  const { token } = getConfig();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getUrl(path: string): string {
  const { baseUrl } = getConfig();
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
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
}): Promise<PaginatedWorlds> {
  const qs = new URLSearchParams();
  if (params?.limit !== undefined) qs.set('limit', String(params.limit));
  if (params?.offset !== undefined) qs.set('offset', String(params.offset));
  if (params?.tag?.length) {
    for (const t of params.tag) qs.append('tag', t);
  }
  if (params?.quality?.length) {
    for (const q of params.quality) qs.append('quality', q);
  }
  const query = qs.toString();
  return request(`/api/worlds${query ? `?${query}` : ''}`);
}

export async function fetchWorld(worldId: string): Promise<World> {
  return request(`/api/worlds/${encodeURIComponent(worldId)}`);
}

export async function fetchTags(): Promise<TagsResponse> {
  return request('/api/tags');
}
