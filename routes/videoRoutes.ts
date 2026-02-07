
import express from 'express';
import { streamVideo, getSignedUrl, createVideo } from '../controllers/videoController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

const router = express.Router();

router.get('/', streamVideo);
router.get('/signed-url', authMiddleware, getSignedUrl);
router.post('/', authMiddleware, adminMiddleware, createVideo);

export default router;
