export interface WorldList {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  worldIds: string[];
  memo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListInput {
  name: string;
  icon?: string | null;
  color?: string;
  memo?: string | null;
}
