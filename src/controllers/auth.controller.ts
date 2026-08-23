import type { NextFunction, Request, Response } from 'express'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import z from 'zod'
import { partialUserSchema, userSchema } from '../schemas/user.schema.ts'
import { PasswordResetModel, UserModel } from '../models/index.ts'
import emailService from '../services/email.service.ts'
import { toCamelCase } from '../utils/index.ts'
import { HttpError } from '../error-handler/http.error.ts'

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

    return res.status(201).json({ ...toCamelCase(newUserQueryData), password: undefined })
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
        const payload = { id: userQueryData.id, email: userQueryData.email, username: userQueryData.username, name: userQueryData.name }
        const authToken = jwt.sign(
            payload,
            String(process.env.AUTH_TOKEN_SECRET),
            { algorithm: 'HS256', expiresIn: '4h' }
        )
        return res.status(200).json({ authToken })
    }
    else {
        return next(new HttpError(401, 'Credenciales invalidas'))
    }
}

async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const start = Date.now()
    const MIN_RESPONSE_TIME_MS = 300

    const result = await z.object({
        email: z
            .email({
                error: (issue) => issue.input === undefined || issue.input === null
                    ? 'El email es requerido'
                    : 'El email no es valido'
            })
    }).safeParseAsync(req.body)

    if (!result.success) {
        return next(result.error)
    }

    const userQuery = UserModel.getUser({ email: result.data.email })

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const { data: userQueryData, error: userQueryError } = await userQuery

    if (userQueryError) {
        return next(userQueryError)
    }

    if (userQueryData) {
        const { data: passwordResetData, error: passwordResetError } = await PasswordResetModel.getPasswordReset({ userId: userQueryData.id })

        if (passwordResetError) {
            return next(passwordResetError)
        }

        if (passwordResetData) {
            const savePasswordResetResponse = await PasswordResetModel.updatePasswordReset({ id: passwordResetData.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) })

            if (savePasswordResetResponse.error) {
                return next(savePasswordResetResponse.error)
            }

            console.log(savePasswordResetResponse.data)
        }
        else {
            const savePasswordResetResponse = await PasswordResetModel.savePasswordReset({ userId: userQueryData?.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) })

            if (savePasswordResetResponse.error) {
                return next(savePasswordResetResponse.error)
            }

            console.log(savePasswordResetResponse.data)
        }

        const emailResult = await emailService.sendResetPasswordEmail(String(process.env.EMAIL_FROM), userQueryData, token)

        if (emailResult.error) {
            console.error(emailResult.error)
        }

        console.log(emailResult.data)
    }

    const elapsed = Date.now() - start
    if (elapsed < MIN_RESPONSE_TIME_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_TIME_MS - elapsed))
    }

    return res.status(200).json({ message: 'Si tu cuenta existe, recibiras un email para restablecer la contraseña' })
}

async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({
        token: z.string('El token es requerido'),
        newPassword: z
            .string({
                error: (issue) => issue.input === undefined || issue.input === null
                    ? 'La contraseña es requerida'
                    : 'La contraseña no es valida'
            })
            .min(8, 'La contraseña debe tener al menos 8 caracteres'),
        confirmNewPassword: z
            .string({
                error: (issue) => issue.input === undefined || issue.input === null
                    ? 'La contraseña es requerida'
                    : 'La contraseña no es valida'
            })
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
    }).safeParseAsync(req.body)

    if (!result.success) {
        return next(result.error)
    }

    const { token, newPassword, confirmNewPassword } = result.data
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const passwordResetQuery = PasswordResetModel.getPasswordReset({ tokenHash })

    if (newPassword !== confirmNewPassword) {
        return next(new HttpError(400, 'Solicitud incorrecta'))
    }

    const { data: passwordResetData, error: passwordResetError } = await passwordResetQuery

    if (passwordResetError) {
        return next(passwordResetError)
    }

    const { data: userQueryData, error: userQueryError } = await UserModel.getUser({ id: passwordResetData?.user_id })

    if (userQueryError) {
        return next(userQueryError)
    }

    if (passwordResetData && userQueryData && passwordResetData.expires_at && passwordResetData.expires_at?.getTime() > Date.now()) {
        const salt = bcrypt.genSalt(10)
        const hashedPassword = bcrypt.hash(newPassword, await salt)
        const { data: updatedUserQueryData, error: updatedUserQueryError } = await UserModel.updateUser({ id: userQueryData.id, password: await hashedPassword })
        const passwordResetDeleteQuery = PasswordResetModel.deletePasswordReset({ id: passwordResetData.id })

        if (updatedUserQueryError) {
            return next(updatedUserQueryError)
        }

        if (!updatedUserQueryData) {
            return next(new HttpError(500, 'No se pudo actualizar el usuario'))
        }

        const { data: passwordResetDeleteData, error: passwordResetDeleteError } = await passwordResetDeleteQuery

        if (passwordResetDeleteError) {
            return next(passwordResetDeleteError)
        }

        console.log(passwordResetDeleteData)

        const emailResult = await emailService.sendChangedPasswordEmail(String(process.env.EMAIL_FROM), updatedUserQueryData)

        if (emailResult.error) {
            console.error(emailResult.error)
        }

        console.log(emailResult.data)

        return res.status(200).json({ ...toCamelCase(updatedUserQueryData), password: undefined })
    }
    else {
        return next(new HttpError(400, 'El enlace no es válido o ha expirado. Solicita uno nuevo.'))
    }
}

async function changePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await partialUserSchema.extend({
        newPassword: z
            .string({
                error: (issue) => issue.input === undefined || issue.input === null
                    ? 'La contraseña es requerida'
                    : 'La contraseña no es valida'
            })
            .min(8, 'La contraseña debe tener al menos 8 caracteres'),
        confirmNewPassword: z
            .string({
                error: (issue) => issue.input === undefined || issue.input === null
                    ? 'La contraseña es requerida'
                    : 'La contraseña no es valida'
            })
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
    }).safeParseAsync(req.body)

    if (!result.success) {
        return next(result.error)
    }

    const { password, newPassword, confirmNewPassword } = result.data
    const { id } = req.payload

    if (!password || (newPassword !== confirmNewPassword) || (password === newPassword)) {
        return next(new HttpError(400, 'Solicitud incorrecta'))
    }

    const { data: userQueryData, error: userQueryError } = await UserModel.getUser({ id })

    if (userQueryError) {
        return next(userQueryError)
    }

    if (userQueryData && (await bcrypt.compare(password, userQueryData.password))) {
        const salt = bcrypt.genSalt(10)
        const hashedPassword = bcrypt.hash(newPassword, await salt)
        const { data: updatedUserQueryData, error: updatedUserQueryError } = await UserModel.updateUser({ id: userQueryData.id, password: await hashedPassword })

        if (updatedUserQueryError) {
            return next(updatedUserQueryError)
        }

        if (!updatedUserQueryData) {
            return next(new HttpError(500, 'No se pudo actualizar el usuario'))
        }

        const emailResult = await emailService.sendChangedPasswordEmail(String(process.env.EMAIL_FROM), updatedUserQueryData)

        if (emailResult.error) {
            console.error(emailResult.error)
        }

        console.log(emailResult.data)

        return res.status(200).json({ ...toCamelCase(updatedUserQueryData), password: undefined })
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
    forgotPassword,
    resetPassword,
    changePassword,
    verify
}
