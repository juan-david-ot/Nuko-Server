import express from 'express'
import { createCore } from '../controllers/core.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = express.Router()

router.post('/', verifyToken, createCore)

export default router
