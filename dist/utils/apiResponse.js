"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
        const response = {
            success: true,
            message,
            data
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message = 'Internal Server Error', statusCode = 500) {
        const response = {
            success: false,
            message
        };
        return res.status(statusCode).json(response);
    }
    static pagination(res, data, page, limit, total) {
        const parsedPage = parseInt(page.toString());
        const parsedLimit = parseInt(limit.toString());
        const response = {
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
exports.default = ApiResponse;
//# sourceMappingURL=apiResponse.js.map