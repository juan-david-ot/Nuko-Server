import express from 'express'
import { requireAuth } from '../middlewares/auth.middleware.ts'
import { CoreController } from '../controllers/index.ts'

const router = express.Router()

router.get('/', requireAuth, CoreController.getUserCores)

router.get('/:id', requireAuth, CoreController.getUserCoreById)

router.get('/:id/information', requireAuth, CoreController.getUserCoreInformationById)

router.post('/', requireAuth, CoreController.createCore)

router.post('/:id/invitation', requireAuth, CoreController.createInvitationToCore)

router.get('/invitation/:token', requireAuth, CoreController.decodeInvitationToCore)

router.post('/invitation/:token', requireAuth, CoreController.acceptInvitationToCore)

export default router
