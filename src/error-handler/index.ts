import { Express, NextFunction, Request, Response } from 'express'
import { UnauthorizedError } from 'express-jwt'
import { PostgrestError } from '@supabase/supabase-js'
import { ZodError } from 'zod'

export class HttpError extends Error {
    statusCode: number

    constructor(statusCode: number, message: string | undefined) {
        super(message)
        this.statusCode = statusCode

        Object.setPrototypeOf(this, HttpError.prototype)
    }
}

export default (app: Express) => {
    app.use((req: Request, res: Response, next: NextFunction) => {
        return next(new HttpError(404, 'Route not found'))
    })

    app.use((error: Error | HttpError | UnauthorizedError | ZodError | PostgrestError, req: Request, res: Response, next: NextFunction) => {
        console.error(error)

        if (error instanceof UnauthorizedError) {
            return res.status(error.status).json({ error: error.code })
        }

        if (error instanceof ZodError) {
            return res.status(400).json({ error: error.issues.map(issue => issue.message) })
        }

        if (error instanceof PostgrestError) {
            return res.status(500).json({ error: 'Could not complete the operation' })
        }

        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ error: error.message })
        }

        return res.status(500).json({
            error: 'Internal server error'
        })
    })
}
