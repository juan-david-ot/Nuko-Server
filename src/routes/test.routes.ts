import express from 'express'
import { test } from '../controllers/test.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/', verifyToken, test)

export default router
