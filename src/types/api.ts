/** Mirrors the backend response envelope (spec §44, §50). */
export interface PageMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

export type ApiResponse<T> =
  { success: true; data: T; meta?: PageMeta } | { success: false; error: ApiErrorBody };
