import { Router } from 'express'
import * as AuthController from '../controllers/auth.controller'
import { me } from '../controllers/auth.controller'
import { devAuth } from '../middlewares/devAuth.middleware'

const router = Router()

router.post('/login', AuthController.login)
router.get('/me', devAuth, me)


export default router
