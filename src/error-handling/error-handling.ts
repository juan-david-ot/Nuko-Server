import { Express, NextFunction, Request, Response } from 'express'

type ValidationError = {
    name: 'ValidationError'
    errors: Record<string, { message: string }>
}

type UnauthorizedError = {
    name: 'UnauthorizedError'
    message: string
}

function isValidationError(error: unknown): error is ValidationError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name: unknown }).name === 'ValidationError' &&
        'errors' in error
    )
}

function isUnauthorizedError(error: unknown): error is UnauthorizedError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name: unknown }).name === 'UnauthorizedError'
    )
}

export default (app: Express) => {
    app.use((req: Request, res: Response) => {
        res.status(404).json({ message: 'This route does not exist' })
    })

    app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
        console.error('ERROR', req.method, req.path, error)

        if (isValidationError(error)) {
            const errorMessages = Object.values(error.errors).map(err => err.message)
            res.status(400).json({ errorMessages })
        }

        if (isUnauthorizedError(error)) {
            res.status(401).json({ message: error.message })
        }

        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error. Check the server console' })
        }
    })
}
