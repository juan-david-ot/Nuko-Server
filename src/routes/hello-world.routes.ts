import express from 'express'
import { helloWorld } from '../controllers/hello-world.controller'

const router = express.Router()

router.get('', helloWorld)

export default router
