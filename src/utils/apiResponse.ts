import { Response } from 'express';

/**
 * @openapi
 * components:
 *   schemas:
 *     PaginationData:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Mevcut sayfa numarası
 *         limit:
 *           type: integer
 *           description: Sayfa başına öğe sayısı
 *         total:
 *           type: integer
 *           description: Toplam öğe sayısı
 *         pages:
 *           type: integer
 *           description: Toplam sayfa sayısı
 *     ApiSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: İşlemin başarılı olup olmadığı
 *           example: true
 *         message:
 *           type: string
 *           description: Başarı mesajı
 *         data:
 *           type: object
 *           description: Dönen veri
 *     ApiErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: İşlemin başarılı olup olmadığı
 *           example: false
 *         message:
 *           type: string
 *           description: Hata mesajı
 *         error:
 *           type: object
 *           description: Hata detayları (opsiyonel)
 *     ApiPaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: İşlemin başarılı olup olmadığı
 *           example: true
 *         data:
 *           type: array
 *           description: Sayfalanmış veri listesi
 *           items:
 *             type: object
 *         pagination:
 *           $ref: '#/components/schemas/PaginationData'
 */

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
  error?: any; // Hata detayları için opsiyonel alan
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

  static error(res: Response, message: string = 'Internal Server Error', statusCode: number = 500, error?: any): Response {
    const response: ApiErrorResponse = {
      success: false,
      message
    };
    
    if (error) {
      response.error = error;
    }
    
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
