import express from 'express'
import { createCore, getUserCores } from '../controllers/core.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = express.Router()

router.get('/', verifyToken, getUserCores)

router.post('/', verifyToken, createCore)

export default router
