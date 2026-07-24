import express from 'express'
import { verifyToken } from '../middlewares/auth.middleware'
import { logIn, signUp, verify } from '../controllers/auth.controller'

const router = express.Router()

router.post('/signUp', signUp)

router.post('/logIn', logIn)

router.get('/verify', verifyToken, verify)

export default router
