import express from 'express'
import { helloWorld } from '../controllers/hello-world.controller.ts'

const router = express.Router()

router.get('', helloWorld)

export default router
