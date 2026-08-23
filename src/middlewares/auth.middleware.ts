import type { NextFunction, Request, Response } from 'express'
import { expressjwt } from 'express-jwt'
import { UserModel } from '../models/index.ts'
import { HttpError } from '../error-handler/http.error.ts'

const verifyToken = expressjwt({
    secret: String(process.env.AUTH_TOKEN_SECRET),
    algorithms: ['HS256'],
    requestProperty: 'payload',
    getToken: getTokenFromHeaders
})

function getTokenFromHeaders(req: Request): string | undefined {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        const authToken = req.headers.authorization.split(' ')[1]
        return authToken
    }
    return undefined
}

async function verifyExpiration(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id, iat } = req.payload

    const { data: userQueryData, error: userQueryError } = await UserModel.getUser({ id })

    if (userQueryError) {
        return next(userQueryError)
    }

    if (!userQueryData) {
        return next(new HttpError(401, 'Usuario no encontrado'))
    }

    if (userQueryData.password_changed_at) {
        const passwordChangedAtSeconds = Math.floor(userQueryData.password_changed_at.getTime() / 1000)

        console.log(iat, passwordChangedAtSeconds)

        if (iat < passwordChangedAtSeconds) {
            return next(new HttpError(401, 'La sesión ha expirado, inicia sesión de nuevo'))
        }
    }

    next()
}

const requireAuth = [verifyToken, verifyExpiration]

export {
    requireAuth
}
