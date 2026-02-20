import express from 'express'
import dotenv from 'dotenv'
import routes from './routes'
import config from './config'

dotenv.config()

const app = express()

config(app)
routes(app)

export default app
