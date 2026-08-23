import express from 'express'
import { verifyToken } from '../middlewares/auth.middleware.ts'
import { AuthController } from '../controllers/index.ts'

const router = express.Router()

router.post('/signUp', AuthController.signUp)

router.post('/logIn', AuthController.logIn)

router.post('/forgotPassword', AuthController.forgotPassword)

router.post('/resetPassword', AuthController.resetPassword)

router.post('/changePassword', verifyToken, AuthController.changePassword)

router.get('/verify', verifyToken, AuthController.verify)

export default router
