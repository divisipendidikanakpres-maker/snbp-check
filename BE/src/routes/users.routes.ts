import { Router } from 'express';
import {
  deleteUser,
  listUsers,
  updateUser,
  updateUserRole,
} from '../controllers/users.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, requireAdmin, listUsers);
router.put('/:id', requireAuth, requireAdmin, updateUser);
router.put('/:id/role', requireAuth, requireAdmin, updateUserRole);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);

export default router;
