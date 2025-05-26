"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorController_1 = require("../controllers/errorController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const errorController = new errorController_1.ErrorController();
// GET /api/errors - Hata loglarını getir (sadece adminler erişebilir)
router.get('/', [auth_1.auth, (0, auth_1.requireRoles)(['admin'])], errorController.getLogs);
exports.default = router;
//# sourceMappingURL=errors.js.map