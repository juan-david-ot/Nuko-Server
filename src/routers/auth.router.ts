import express from 'express'
import { verifyToken } from '../middlewares/auth.middleware'
import { AuthController } from '../controllers'

const router = express.Router()

router.post('/signUp', AuthController.signUp)

router.post('/logIn', AuthController.logIn)

router.get('/verify', verifyToken, AuthController.verify)

export default router
