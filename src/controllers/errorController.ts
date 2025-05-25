import { Request, Response } from 'express';
import { ErrorLogService } from '../error/services/ErrorLogService';
import ApiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';

export class ErrorController {
  private readonly errorLogService: ErrorLogService;

  constructor() {
    this.errorLogService = new ErrorLogService();
  }

  /**
   * @openapi
   * /api/errors:
   *   get:
   *     summary: Get error logs
   *     description: Retrieves error logs with pagination support.
   *     tags:
   *       - Errors
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: The page number.
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: The number of items per page.
   *     responses:
   *       200:
   *         description: Successful operation
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiPaginatedResponse'
   *       400:
   *         description: Bad Request - Invalid page or limit parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *       403:
   *         description: Forbidden - User is not authorized.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *       500:
   *         description: Internal Server Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  getLogs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = req.query;

    if (!page || !limit) {
      ApiResponse.error(res, 'Page ve limit parametreleri zorunludur.', 400);
      return;
    }

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      ApiResponse.error(res, 'Page ve limit parametreleri geçerli sayılar olmalıdır.', 400);
      return;
    }

    const logs = await this.errorLogService.getPaginatedLogs({ limit: limitNumber, offset: (pageNumber - 1) * limitNumber });
    ApiResponse.success(res, logs.rows, 'Logs retrieved successfully');
  });
}