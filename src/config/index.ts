import express, { type Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import logger from 'morgan'
import cookieParser from 'cookie-parser'

export default (app: Express): void => {
    app.set('trust proxy', 1)

    app.use(helmet())
    app.use(
        cors({
            origin: [String(process.env.ORIGIN)]
        })
    )

    app.use(logger('dev'))

    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
}
