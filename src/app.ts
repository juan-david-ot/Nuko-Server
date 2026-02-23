import 'dotenv/config'
import './db'
import express from 'express'
import errorHandling from './error-handling'
import config from './config'
import routes from './routes'

const app = express()

config(app)
routes(app)
errorHandling(app)

export default app
