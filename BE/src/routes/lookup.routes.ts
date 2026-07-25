import { Router } from 'express';
import {
  createJenjang,
  createKelompok,
  deleteJenjang,
  deleteKelompok,
  listJenjang,
  listKelompok,
} from '../controllers/lookup.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/kelompok', requireAuth, requireAdmin, listKelompok);
router.post('/kelompok', requireAuth, requireAdmin, createKelompok);
router.delete('/kelompok/:id', requireAuth, requireAdmin, deleteKelompok);

router.get('/jenjang', requireAuth, requireAdmin, listJenjang);
router.post('/jenjang', requireAuth, requireAdmin, createJenjang);
router.delete('/jenjang/:id', requireAuth, requireAdmin, deleteJenjang);

export default router;
