import type { WorldList } from '../types/lists';
import { clearListsDb, putLists } from '../utils/listsDb';

export async function resetListsDb(): Promise<void> {
  await clearListsDb();
}

export async function seedListsDb(lists: WorldList[]): Promise<void> {
  await putLists(lists);
}
