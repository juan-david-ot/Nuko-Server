import express, { Express, Request, Response } from 'express'
import logger from 'morgan'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const FRONTEND_URL = process.env.ORIGIN || 'http://localhost:2409' // Poner IP del ordenador para probar en dispositivos
const TOKEN_SECRET = process.env.TOKEN_SECRET || ''

export default (app: Express) => {
    app.set('trust proxy', 1)

    app.use(
        cors({
            origin: [FRONTEND_URL]
        })
    )

    app.use(logger('dev'))
    app.use(cookieParser())

    app.use((req: Request, res: Response, next) => {
        const token = req.cookies.access_token

        // const token = jwt.sign(
        //     { id: 1, username: 'JuanDa' },
        //     TOKEN_SECRET,
        //     { expiresIn: '6h' }
        // )

        res.locals = { user: null }

        try {
            if (token) {
                const data = jwt.verify(token, TOKEN_SECRET)
                res.locals.user = data
            }
        }
        catch (error) {
            console.error(error)
        }

        next()
    })

    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
}
