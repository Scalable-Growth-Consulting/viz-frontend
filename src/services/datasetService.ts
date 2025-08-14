// Lightweight dataset service using localStorage as a stand-in for cloud API
// Replace with real API calls when backend endpoints are available

export interface DatasetSummary {
  id: string;
  name: string;
  tableName: string;
  rows: number;
  updatedAt: string; // ISO date
  columns: string[]; // first few columns
}

const key = (userId: string) => `dufa-datasets-${userId || 'anonymous'}`;

export const datasetService = {
  list: async (userId: string): Promise<DatasetSummary[]> => {
    try {
      const raw = localStorage.getItem(key(userId));
      if (!raw) return [];
      return JSON.parse(raw) as DatasetSummary[];
    } catch {
      return [];
    }
  },
  add: async (userId: string, dataset: DatasetSummary): Promise<void> => {
    const list = await datasetService.list(userId);
    const next = [dataset, ...list.filter(d => d.id !== dataset.id)];
    localStorage.setItem(key(userId), JSON.stringify(next));
  },
  remove: async (userId: string, id: string): Promise<void> => {
    const list = await datasetService.list(userId);
    const next = list.filter(d => d.id !== id);
    localStorage.setItem(key(userId), JSON.stringify(next));
  }
};
