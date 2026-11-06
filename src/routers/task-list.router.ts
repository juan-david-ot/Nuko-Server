import express from 'express'
import { requireAuth } from '../middlewares/auth.middleware.ts'
import { TaskListController } from '../controllers/index.ts'

const router = express.Router()

router.get('/cores/:coreId', requireAuth, TaskListController.getTaskListsByCoreId)

export default router
