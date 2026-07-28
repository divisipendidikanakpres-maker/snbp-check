import { Router } from 'express';
import {
  createProdi,
  deleteProdi,
  getProdi,
  listProdi,
  suggestProdiAlternatives,
  updateProdi,
} from '../controllers/prodi.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', listProdi);
router.get('/suggestions', suggestProdiAlternatives);
router.get('/:id', getProdi);
router.post('/', requireAuth, requireAdmin, createProdi);
router.put('/:id', requireAuth, requireAdmin, updateProdi);
router.delete('/:id', requireAuth, requireAdmin, deleteProdi);

export default router;
