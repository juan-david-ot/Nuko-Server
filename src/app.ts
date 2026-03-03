import 'dotenv/config'
import './db'
import express from 'express'
import errorHandler from './error-handler'
import config from './config'
import routes from './routers'

const app = express()

config(app)
routes(app)
errorHandler(app)

export default app
