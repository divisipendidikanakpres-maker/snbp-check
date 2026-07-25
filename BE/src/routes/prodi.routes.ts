import { Router } from 'express';
import {
  createProdi,
  deleteProdi,
  listProdi,
  updateProdi,
} from '../controllers/prodi.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, requireAdmin, listProdi);
router.post('/', requireAuth, requireAdmin, createProdi);
router.put('/:id', requireAuth, requireAdmin, updateProdi);
router.delete('/:id', requireAuth, requireAdmin, deleteProdi);

export default router;
