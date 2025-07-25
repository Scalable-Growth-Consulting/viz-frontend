export interface ChartData {
  chartScript: string | null;
}

export interface QueryResponse {
  answer: string;
  sql: string;
  queryData?: any[][];
}

export interface APIResponse<T> {
  data: T | null;
  error: Error | null;
} 