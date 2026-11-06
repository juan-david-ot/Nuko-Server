import express from 'express'
import { requireAuth } from '../middlewares/auth.middleware.ts'
import { AuthController } from '../controllers/index.ts'

const router = express.Router()

router.post('/sign-up', AuthController.signUp)

router.post('/log-in', AuthController.logIn)

router.post('/forgot-password', AuthController.forgotPassword)

router.post('/reset-password', AuthController.resetPassword)

router.post('/change-password', requireAuth, AuthController.changePassword)

router.get('/verify', requireAuth, AuthController.verify)

export default router
