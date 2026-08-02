import express from 'express'
import { verifyToken } from '../middlewares/auth.middleware.ts'
import { CoreController } from '../controllers/index.ts'

const router = express.Router()

router.get('/', verifyToken, CoreController.getUserCores)

router.get('/:id', verifyToken, CoreController.getUserCoreById)

router.get('/:id/information', verifyToken, CoreController.getUserCoreInformationById)

router.post('/', verifyToken, CoreController.createCore)

router.post('/:id/invitation', verifyToken, CoreController.createInvitationToCore)

router.post('/invitation/:token', verifyToken, CoreController.acceptInvitationToCore)

export default router
