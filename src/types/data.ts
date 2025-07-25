export interface ChartData {
  chartScript: string | null;
}

export interface QueryResponse {
  answer: string;
  sql: string;
  queryData?: unknown[][];
}

export interface APIResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface InferenceFunctionResponse {
  success: boolean;
  data: {
    answer: string;
    sql: string;
    queryData?: unknown[][];
  };
}

export interface GenerateChartFunctionResponse {
  success: boolean;
  chart_code: string;
}

export interface SupabaseFunctionError {
  error: string;
  errorType: 'timeout' | 'general';
} 