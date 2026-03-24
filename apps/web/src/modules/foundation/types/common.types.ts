/**
 * @contract FR-013, EX-OAS-001
 * Common types shared across Foundation module.
 * ProblemDetails follows RFC 9457. Pagination is cursor-based.
 */

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  extensions?: {
    correlationId?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface GenericMessage {
  message: string;
}

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}
