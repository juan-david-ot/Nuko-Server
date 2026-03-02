import { Request } from 'express'
import { expressjwt } from 'express-jwt'

const TOKEN_SECRET = process.env.TOKEN_SECRET || ''

export const verifyToken = expressjwt({
    secret: TOKEN_SECRET,
    algorithms: ['HS256'],
    requestProperty: 'payload',
    getToken: getTokenFromHeaders
})

function getTokenFromHeaders(req: Request): string | undefined {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        const token = req.headers.authorization.split(' ')[1]
        return token
    }
    return undefined
}
