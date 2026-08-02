import express from 'express'
import 'dotenv/config'
import './db/index.ts'
import config from './config/index.ts'
import routers from './routers/index.ts'
import errorHandler from './error-handler/index.ts'

const app = express()

config(app)
routers(app)
errorHandler(app)

export default app
