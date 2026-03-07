import express from 'express'
import { verifyToken } from '../middlewares/auth.middleware'
import { login, signup, verify } from '../controllers/auth.controller'

const router = express.Router()

router.post('/signup', signup)

router.get('/login', login)

router.get('/verify', verifyToken, verify)

export default router
