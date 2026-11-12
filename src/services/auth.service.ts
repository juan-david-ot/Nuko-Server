import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { DBUser } from '../definitions/types.ts'

async function hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSalt(10)
    return bcrypt.hash(password, await salt)
}

function signAuthToken(user: DBUser): string {
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name
    }

    return jwt.sign(
        payload,
        String(process.env.AUTH_TOKEN_SECRET),
        { algorithm: 'HS256', expiresIn: '7d' }
    )
}

export default {
    hashPassword,
    signAuthToken
}
