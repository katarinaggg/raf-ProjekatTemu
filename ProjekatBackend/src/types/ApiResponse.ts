export interface ApiResponse<T = undefined> {
  failed: boolean;
  message?: string;
  data?: T;
  token?: string;
}
