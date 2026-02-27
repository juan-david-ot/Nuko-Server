import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const TOKEN_SECRET = process.env.TOKEN_SECRET || ''

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.access_token

    if (token) {
        try {
            const payload = jwt.verify(token, TOKEN_SECRET)
            res.locals.user = payload
            return next()
        }
        catch (error) {
            return next(error)
        }
    }
    return res.status(401).json({ error: 'Invalid token' })
}
