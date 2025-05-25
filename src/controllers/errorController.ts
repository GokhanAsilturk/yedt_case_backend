import { Request, Response } from 'express';
import { ErrorLogService } from '../error/services/ErrorLogService';
import ApiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';

export class ErrorController {
  private readonly errorLogService: ErrorLogService;

  constructor() {
    this.errorLogService = new ErrorLogService();
  }

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