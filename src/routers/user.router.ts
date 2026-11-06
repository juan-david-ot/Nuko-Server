import express from 'express'
import { requireAuth } from '../middlewares/auth.middleware.ts'

const router = express.Router()

// router.get('/cores/:coreId', requireAuth, UserController.getUsersByCoreId)

export default router
