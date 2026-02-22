import express from 'express'
import { HelloWorldController } from '../controllers/hello-world.controller'

const router = express.Router()

router.get('', HelloWorldController.helloWorld)

export default router
