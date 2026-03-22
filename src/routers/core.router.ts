import express from 'express'
import { acceptInvitationToCore, createCore, createInvitationToCore, getUserCores } from '../controllers/core.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/', verifyToken, getUserCores)

router.post('/', verifyToken, createCore)

router.post('/:id/invitation', verifyToken, createInvitationToCore)

router.post('/invitation/:token', verifyToken, acceptInvitationToCore)

export default router
