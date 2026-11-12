import express from 'express'
import { requireAuth } from '../middlewares/auth.middleware.ts'
import { isUserInCore } from '../middlewares/core.middleware.ts'
import { CoreController } from '../controllers/index.ts'

const router = express.Router()

router.get('/', requireAuth, CoreController.getUserCores)

router.get('/:coreId', requireAuth, isUserInCore, CoreController.getCoreById)

router.get('/:coreId/users', requireAuth, isUserInCore, CoreController.getCoreUsersById)

router.post('/', requireAuth, CoreController.createCore)

router.post('/:coreId/invitation', requireAuth, isUserInCore, CoreController.createInvitationToCore)

router.get('/invitation/:token', requireAuth, CoreController.decodeInvitationToCore)

router.post('/invitation/:token', requireAuth, CoreController.acceptInvitationToCore)

router.delete('/:coreId/leave', requireAuth, isUserInCore, CoreController.leaveCoreById)

export default router
