import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { partialUserSchema, userSchema } from '../schemas/user.schema'
import * as UserModel from '../models/pg.user.model'
import { HttpError } from '../error-handler/http.error'

async function signUp(req: Request, res: Response, next: NextFunction) {
    const result = await userSchema.safeParseAsync(req.body)

    if (!result.success) {
        return next(result.error)
    }

    const emailQuery = UserModel.getUser({ email: result.data.email })
    const usernameQuery = UserModel.getUser({ username: result.data.username })

    const [{ rows: emailData }, { rows: usernameData }] = await Promise.all([emailQuery, usernameQuery])

    if (emailData.length > 0 || usernameData.length > 0) {
        return next(new HttpError(400, 'El nombre de usuario o el email ya existe'))
    }

    const salt = bcrypt.genSalt(10)
    const hashedPassword = bcrypt.hash(result.data.password, await salt)
    const newUser = { ...result.data, password: await hashedPassword }

    const { rows: [newUserData] } = await UserModel.saveUser(newUser)

    return res.status(201).json({ id: newUserData?.id, email: newUserData?.email, username: newUserData?.username, password: undefined, name: newUserData?.name, surname: newUserData?.surname, createdAt: newUserData?.created_at })
}

async function logIn(req: Request, res: Response, next: NextFunction) {
    const result = await partialUserSchema.safeParseAsync(req.body)

    if (!result.success) {
        return next(result.error)
    }

    const { email, username, password } = result.data

    if (!password || (!email && !username)) {
        return next(new HttpError(401, 'Solicitud incorrecta'))
    }

    const { rows: [userData] } = (await UserModel.getUser(email ? { email } : { username }))

    if (userData && (await bcrypt.compare(password, userData.password))) {
        const payload = { id: userData.id, email: userData.email, username: userData.username }
        const authToken = jwt.sign(
            payload,
            String(process.env.TOKEN_SECRET),
            { algorithm: 'HS256', expiresIn: '4h' }
        )
        return res.status(200).json({ authToken })
    }
    else {
        return next(new HttpError(401, 'Credenciales invalidas'))
    }
}

async function verify(req: Request, res: Response) {
    const authUser = req.payload

    return res.status(200).json({ authUser })
}

export {
    signUp,
    logIn,
    verify
}
