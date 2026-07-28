import { Router } from 'express';
import {
  createUniversitas,
  deleteUniversitas,
  getUniversitas,
  listUniversitas,
  updateUniversitas,
} from '../controllers/universitas.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', listUniversitas);
router.post('/', requireAuth, requireAdmin, createUniversitas);
router.get('/:id', requireAuth, getUniversitas);
router.put('/:id', requireAuth, requireAdmin, updateUniversitas);
router.delete('/:id', requireAuth, requireAdmin, deleteUniversitas);

export default router;
