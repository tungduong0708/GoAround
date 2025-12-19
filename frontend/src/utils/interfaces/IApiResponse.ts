/**
 * Standard API response wrapper for all backend responses.
 * The backend wraps all responses in this format.
 */
// TODO: This wrapper may be deprecated in favor of using IApiResponse with IPaginatedResponse directly.


/**
 * Pagination metadata returned by list endpoints.
 * Available for: 
 * GET /places, 
 * GET /places/{id}/reviews, 
 * GET /trips,
 * GET /lists, 
 * GET /lists/{id}, 
 * GET /forum/posts, 
 * GET /forum/posts/{id},
 * GET /admin/reports
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  total_items: number;
}

/**
 * Paginated API response with meta information.
 * The results are always wrapped in this format. 
 */

// Current fix: Both paginated and non-paginated responses use the wrapper with the same format.

// In the future, we may deprecate IPaginatedResponse and use IApiResponse with T being an array or single object directly.
export interface IPaginatedResponse<T> {
  data: T;
  meta: IPaginationMeta;
}

export interface IApiResponse<T> {
  data: T;
  meta: IPaginationMeta;
}

// TODO: This wrapper may be deprecated in favor of using other IPaginationMeta directly.

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
