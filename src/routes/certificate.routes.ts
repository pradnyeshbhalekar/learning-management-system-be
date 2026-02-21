import { Router } from 'express';
import * as certificateController from '../controllers/certificate.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/generate', requireAuth, certificateController.generateCertificate);
router.get('/user/:userId', requireAuth, certificateController.getUserCertificates);
router.get('/pending', requireAuth, certificateController.getPendingCertificates);
router.put('/approve/:id', requireAuth, certificateController.approveCertificate);

export default router;
