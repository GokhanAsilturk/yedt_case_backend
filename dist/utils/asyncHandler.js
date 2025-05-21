"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generic asyncHandler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next);
};
exports.default = asyncHandler;
//# sourceMappingURL=asyncHandler.js.map