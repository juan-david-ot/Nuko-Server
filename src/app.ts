import express from 'express'
import dotenv from 'dotenv'
import config from './config'
import routes from './routes'
import errorHandling from './error-handling'

dotenv.config()

const app = express()

config(app)
routes(app)
errorHandling(app)

export default app
