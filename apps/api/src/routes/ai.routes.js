import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { generateCoverLetter } from '../controllers/ai.controller.js';

const router = Router();

router.use(verifyJWT);

router.post('/cover-letter', generateCoverLetter);

export default router;