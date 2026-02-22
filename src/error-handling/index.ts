import { Express, NextFunction, Request, Response } from 'express'

export default (app: Express) => {
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.warn('WARNING', req.method, req.path, 'Route not found')
        res.status(404).json({ message: 'This route does not exist' })
    })

    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        console.error('ERROR', req.method, req.path, error)

        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error. Check the server console' })
        }
    })
}
