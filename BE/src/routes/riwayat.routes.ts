import { Router } from 'express';
import { createRiwayat, listRiwayat, deleteRiwayat } from '../controllers/riwayat.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, createRiwayat);
router.get('/', requireAuth, requireAdmin, listRiwayat);
router.delete('/:id', requireAuth, requireAdmin, deleteRiwayat);

export default router;
