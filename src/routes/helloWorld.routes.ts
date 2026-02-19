import express from 'express'
import { helloWorld } from '../controllers/helloWorld.controller'

const router = express.Router()

router.get('', helloWorld)

export default router
