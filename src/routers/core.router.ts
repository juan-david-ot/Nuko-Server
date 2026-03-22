import express from 'express'
import { createCore, createInvitationToCore, getUserCores } from '../controllers/core.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/', verifyToken, getUserCores)

router.post('/', verifyToken, createCore)

router.post('/invitations', verifyToken, createInvitationToCore)

export default router
