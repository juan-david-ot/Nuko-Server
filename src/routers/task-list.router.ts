import express from 'express'
import { requireAuth } from '../middlewares/auth.middleware.ts'
import { isUserInCore } from '../middlewares/core.middleware.ts'
import { TaskListController } from '../controllers/index.ts'

const router = express.Router()

router.get('/cores/:coreId', requireAuth, isUserInCore, TaskListController.getTaskListsByCoreId)

export default router
