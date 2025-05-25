import { Router } from 'express';
import { ErrorController } from '../controllers/errorController';
import { auth, requireRoles } from '../middleware/auth';

const router = Router();
const errorController = new ErrorController();

// GET /api/errors - Hata loglarını getir (sadece adminler erişebilir)
router.get('/', [auth, requireRoles(['admin'])], errorController.getLogs);

export default router;