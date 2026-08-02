import express from 'express'
import { test } from '../controllers/test.controller.ts'
import { verifyToken } from '../middlewares/auth.middleware.ts'

const router = express.Router()

router.get('/', verifyToken, test)

export default router
