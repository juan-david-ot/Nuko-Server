import { Express, NextFunction, Request, Response } from 'express'

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

    app.use((error: Error | HttpError, req: Request, res: Response, next: NextFunction) => {
        console.error(error)

        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({
                error: error.message
            })
        }

        return res.status(500).json({
            error: 'Internal server error'
        })
    })
}
