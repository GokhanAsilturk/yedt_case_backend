"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorController = void 0;
const ErrorLogService_1 = require("../error/services/ErrorLogService");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class ErrorController {
    constructor() {
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
        this.getLogs = (0, asyncHandler_1.default)(async (req, res) => {
            const { page, limit } = req.query;
            if (!page || !limit) {
                apiResponse_1.default.error(res, 'Page ve limit parametreleri zorunludur.', 400);
                return;
            }
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
                apiResponse_1.default.error(res, 'Page ve limit parametreleri geçerli sayılar olmalıdır.', 400);
                return;
            }
            const logs = await this.errorLogService.getPaginatedLogs({ limit: limitNumber, offset: (pageNumber - 1) * limitNumber });
            apiResponse_1.default.success(res, logs.rows, 'Logs retrieved successfully');
        });
        this.errorLogService = new ErrorLogService_1.ErrorLogService();
    }
}
exports.ErrorController = ErrorController;
//# sourceMappingURL=errorController.js.map