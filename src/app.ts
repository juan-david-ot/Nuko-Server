import express from 'express'
import 'dotenv/config'
import './db'
import config from './config'
import routes from './routers'
import errorHandler from './error-handler'

const app = express()

config(app)
routes(app)
errorHandler(app)

export default app
