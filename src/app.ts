import express from 'express'
import dotenv from 'dotenv'
import errorHandling from './error-handling'
import config from './config'
import routes from './routes'

dotenv.config()

const app = express()

config(app)
routes(app)
errorHandling(app)

export default app
