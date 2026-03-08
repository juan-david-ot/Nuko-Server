import { Request } from 'express'
import { expressjwt } from 'express-jwt'

const TOKEN_SECRET = process.env.TOKEN_SECRET || ''

const verifyToken = expressjwt({
    secret: TOKEN_SECRET,
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

export {
    verifyToken
}
