import express, { Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import logger from 'morgan'
import cookieParser from 'cookie-parser'

const FRONTEND_URL = process.env.ORIGIN || 'http://localhost:2409'

export default (app: Express) => {
    app.set('trust proxy', 1)

    app.use(helmet())
    app.use(
        cors({
            origin: [FRONTEND_URL]
        })
    )

    app.use(logger('dev'))

    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
}
