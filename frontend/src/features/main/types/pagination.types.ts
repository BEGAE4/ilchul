export interface PaginatedResponse<T> {
  status: number;
  message: string;
  data: T[];
  page: number;
  limit: number;
  hasNext: boolean;
  totalCount: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface NearbyParams extends PaginationParams {
  lat: number;
  lng: number;
}
