/**
 * Standard API response wrapper for all backend responses.
 * The backend wraps all responses in this format.
 */
export interface IApiResponse<T> {
  status: "success" | "error";
  data: T;
}

/**
 * Pagination metadata returned by list endpoints.
 * Available for: GET /places, GET /places/{id}/reviews, GET /trips,
 * GET /lists, GET /lists/{id}, GET /forum/posts, GET /forum/posts/{id},
 * GET /admin/reports
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
}

/**
 * Paginated API response with meta information.
 */
export interface IPaginatedResponse<T> {
  status: "success" | "error";
  data: T;
  meta: IPaginationMeta;
}

/**
 * Field-level validation error
 */
export interface IFieldError {
  field: string;
  message: string;
}

/**
 * Standard error response format from the API.
 */
export interface IErrorResponse {
  status: "error";
  message: string;
  errors?: IFieldError[];
}
