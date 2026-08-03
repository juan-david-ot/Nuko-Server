import type { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { partialUserSchema, userSchema } from '../schemas/user.schema.ts'
import { UserModel } from '../models/index.ts'
import { HttpError } from '../error-handler/http.error.ts'
import emailService from '../services/email.service.ts'

async function signUp(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await userSchema.safeParseAsync(req.body)

    if (!result.success) {
        return next(result.error)
    }

    const emailQuery = UserModel.getUser({ email: result.data.email })
    const usernameQuery = UserModel.getUser({ username: result.data.username })

    const [
        { data: emailQueryData, error: emailQueryError },
        { data: usernameQueryData, error: usernameQueryError }
    ] = await Promise.all([emailQuery, usernameQuery])

    if (emailQueryError || usernameQueryError) {
        return next(emailQueryError || usernameQueryError)
    }

    if (emailQueryData || usernameQueryData) {
        return next(new HttpError(400, 'El nombre de usuario o el email ya existe'))
    }

    const salt = bcrypt.genSalt(10)
    const hashedPassword = bcrypt.hash(result.data.password, await salt)
    const newUser = { ...result.data, password: await hashedPassword }

    const { data: newUserQueryData, error: newUserQueryError } = await UserModel.saveUser(newUser)

    if (newUserQueryError) {
        return next(newUserQueryError)
    }

    if (!newUserQueryData) {
        return next(new HttpError(500, 'No se pudo crear el usuario'))
    }

    const emailResult = await emailService.sendWelcomeEmail(String(process.env.EMAIL_FROM), newUserQueryData)

    if (emailResult.error) {
        console.error(emailResult.error)
    }

    console.log(emailResult.data)

    return res.status(201).json({ id: newUserQueryData.id, email: newUserQueryData.email, username: newUserQueryData.username, password: undefined, name: newUserQueryData.name, surname: newUserQueryData.surname, createdAt: newUserQueryData.created_at })
}

async function logIn(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await partialUserSchema.safeParseAsync(req.body)

    if (!result.success) {
        return next(result.error)
    }

    const { email, username, password } = result.data

    if (!password || (!email && !username)) {
        return next(new HttpError(401, 'Solicitud incorrecta'))
    }

    const { data: userQueryData, error: userQueryError } = await UserModel.getUser(email ? { email } : { username })

    if (userQueryError) {
        return next(userQueryError)
    }

    if (userQueryData && (await bcrypt.compare(password, userQueryData.password))) {
        const payload = { id: userQueryData.id, email: userQueryData.email, username: userQueryData.username }
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

async function verify(req: Request, res: Response): Promise<Response> {
    const authUser = req.payload

    return res.status(200).json({ authUser })
}

export {
    signUp,
    logIn,
    verify
}
