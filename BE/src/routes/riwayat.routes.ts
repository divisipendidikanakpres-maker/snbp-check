import { Router } from 'express';
import { createRiwayat, listRiwayat, listMyRiwayat, deleteRiwayat } from '../controllers/riwayat.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, createRiwayat);
router.get('/me', requireAuth, listMyRiwayat);
router.get('/', requireAuth, requireAdmin, listRiwayat);
router.delete('/:id', requireAuth, deleteRiwayat);

export default router;

