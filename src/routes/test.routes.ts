import express from 'express'
import { TestController } from '../controllers/test.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/', verifyToken, TestController.test)

export default router
