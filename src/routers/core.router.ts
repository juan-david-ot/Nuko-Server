import express from 'express'
import { verifyToken } from '../middlewares/auth.middleware'
import { acceptInvitationToCore, createCore, createInvitationToCore, getUserCoreById, getUserCoreInformationById, getUserCores } from '../controllers/core.controller'

const router = express.Router()

router.get('/', verifyToken, getUserCores)

router.get('/:id', verifyToken, getUserCoreById)

router.get('/:id/information', verifyToken, getUserCoreInformationById)

router.post('/', verifyToken, createCore)

router.post('/:id/invitation', verifyToken, createInvitationToCore)

router.post('/invitation/:token', verifyToken, acceptInvitationToCore)

export default router
