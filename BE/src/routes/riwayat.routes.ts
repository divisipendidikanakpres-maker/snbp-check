import { Router } from 'express';
import { createRiwayat, listRiwayat } from '../controllers/riwayat.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, createRiwayat);
router.get('/', requireAuth, requireAdmin, listRiwayat);

export default router;
