import { Response } from 'express';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationData;
}

class ApiResponse {
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): Response {
    const response: ApiSuccessResponse<T> = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string = 'Internal Server Error', statusCode: number = 500): Response {
    const response: ApiErrorResponse = {
      success: false,
      message
    };
    return res.status(statusCode).json(response);
  }

  static pagination<T>(res: Response, data: T[], page: number | string, limit: number | string, total: number): Response {
    const parsedPage = parseInt(page.toString());
    const parsedLimit = parseInt(limit.toString());
    const response: ApiPaginatedResponse<T> = {
      success: true,
      data,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit)
      }
    };
    return res.status(200).json(response);
  }
}

export default ApiResponse;
