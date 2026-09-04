import { Router } from 'express';
import { proxySearchUniversitas, proxyGetProdi } from '../controllers/pddikti.controller';

const router = Router();

router.get('/universitas', proxySearchUniversitas);
router.get('/prodi', proxyGetProdi);

export default router;
