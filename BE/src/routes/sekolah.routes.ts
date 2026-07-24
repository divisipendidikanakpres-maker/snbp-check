import { Router } from 'express';
import {
  createSekolah,
  deleteSekolah,
  getSekolah,
  listSekolah,
  updateSekolah,
} from '../controllers/sekolah.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', listSekolah);
router.post('/', requireAuth, requireAdmin, createSekolah);
router.get('/:id', requireAuth, requireAdmin, getSekolah);
router.put('/:id', requireAuth, requireAdmin, updateSekolah);
router.delete('/:id', requireAuth, requireAdmin, deleteSekolah);

export default router;
