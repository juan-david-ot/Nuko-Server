import express from 'express'
import 'dotenv/config'
import './db'
import config from './config'
import routers from './routers'
import errorHandler from './error-handler'

const app = express()

config(app)
routers(app)
errorHandler(app)

export default app
