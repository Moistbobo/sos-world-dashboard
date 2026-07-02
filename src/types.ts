export interface World {
  worldId: string;
  name: string;
  authorName: string;
  capacity: number;
  platforms: string[];
  tags: string[];
  imageUrl: string;
  vrchatUrl: string;
  quality: 'good' | 'bad' | null;
  createdAt: string;
  internalAddDate?: string;
}

export interface PaginatedWorlds {
  total: number;
  limit: number;
  offset: number;
  worlds: World[];
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface TagsResponse {
  tags: TagCount[];
}

export interface QualityCount {
  quality: 'good' | 'bad';
  count: number;
}

export interface PlatformCount {
  platform: string;
  count: number;
}

export interface FilterCountsResponse {
  qualityCounts: QualityCount[];
  platformCounts: PlatformCount[];
}

export interface HealthResponse {
  status: 'ok';
  worldCount: number;
  dbVersion: number;
}
