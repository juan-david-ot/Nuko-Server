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

    if (result.error) {
        return next(result.error)
    }

    const emailQuery = UserModel.getUser({ email: result.data.email })
    const usernameQuery = UserModel.getUser({ username: result.data.username })

    const [emailResponse, usernameResponse] = await Promise.all([emailQuery, usernameQuery])

    if (emailResponse.error || usernameResponse.error) {
        return next(emailResponse.error || usernameResponse.error)
    }

    if (emailResponse.data || usernameResponse.data) {
        return next(new HttpError(400, 'El nombre de usuario o el email ya existe'))
    }

    const salt = bcrypt.genSalt(10)
    const hashedPassword = bcrypt.hash(result.data.password, await salt)
    const newUser = { ...result.data, password: await hashedPassword }

    const newUserResponse = await UserModel.saveUser(newUser)

    if (newUserResponse.error) {
        return next(newUserResponse.error)
    }

    if (!newUserResponse.data) {
        return next(new HttpError(500, 'No se pudo crear el usuario'))
    }

    const sendEmailResult = await emailService.sendWelcomeEmail(String(process.env.EMAIL_FROM), newUserResponse.data)

    if (sendEmailResult.error) {
        console.error(sendEmailResult.error)
    }

    console.log(sendEmailResult.data)

    return res.status(201).json({ ...toCamelCase(newUserResponse.data), password: undefined, passwordChangedAt: undefined })
}

async function logIn(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await partialUserSchema.safeParseAsync(req.body)

    if (result.error) {
        return next(result.error)
    }

    const { email, username, password } = result.data

    if (!password || (!email && !username)) {
        return next(new HttpError(401, 'Solicitud incorrecta'))
    }

    const userResponse = await UserModel.getUser(email ? { email } : { username })

    if (userResponse.error) {
        return next(userResponse.error)
    }

    if (userResponse.data && (await bcrypt.compare(password, userResponse.data.password))) {
        const payload = { id: userResponse.data.id, email: userResponse.data.email, username: userResponse.data.username, name: userResponse.data.name }
        const isMobile = req.headers['x-client-platform'] === 'ios' || req.headers['x-client-platform'] === 'android'
        const expiresIn = isMobile ? '7d' : '6h'
        const authToken = jwt.sign(
            payload,
            String(process.env.AUTH_TOKEN_SECRET),
            { algorithm: 'HS256', expiresIn }
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

    if (result.error) {
        return next(result.error)
    }

    const userQuery = UserModel.getUser({ email: result.data.email })

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const userResponse = await userQuery

    if (userResponse.error) {
        return next(userResponse.error)
    }

    if (userResponse.data) {
        const passwordResetResponse = await PasswordResetModel.getPasswordReset({ userId: userResponse.data.id })

        if (passwordResetResponse.error) {
            return next(passwordResetResponse.error)
        }

        if (passwordResetResponse.data) {
            const updatePasswordResetResponse = await PasswordResetModel.updatePasswordReset({ id: passwordResetResponse.data.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) })

            if (updatePasswordResetResponse.error) {
                return next(updatePasswordResetResponse.error)
            }

            console.log(updatePasswordResetResponse.data)
        }
        else {
            const newPasswordResetResponse = await PasswordResetModel.savePasswordReset({ userId: userResponse.data.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) })

            if (newPasswordResetResponse.error) {
                return next(newPasswordResetResponse.error)
            }

            console.log(newPasswordResetResponse.data)
        }

        const sendEmailResult = await emailService.sendResetPasswordEmail(String(process.env.EMAIL_FROM), userResponse.data, token)

        if (sendEmailResult.error) {
            console.error(sendEmailResult.error)
        }

        console.log(sendEmailResult.data)
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

    if (result.error) {
        return next(result.error)
    }

    const { token, newPassword, confirmNewPassword } = result.data
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const passwordResetQuery = PasswordResetModel.getPasswordReset({ tokenHash })

    if (newPassword !== confirmNewPassword) {
        return next(new HttpError(400, 'Solicitud incorrecta'))
    }

    const passwordResetResponse = await passwordResetQuery

    if (passwordResetResponse.error) {
        return next(passwordResetResponse.error)
    }

    if (!passwordResetResponse.data) {
        return next(new HttpError(400, 'El enlace no es válido o ha expirado. Solicita uno nuevo.'))
    }

    const userResponse = await UserModel.getUser({ id: passwordResetResponse.data.user_id })

    if (userResponse.error) {
        return next(userResponse.error)
    }

    if (passwordResetResponse.data && userResponse.data && passwordResetResponse.data.expires_at && passwordResetResponse.data.expires_at?.getTime() > Date.now()) {
        const salt = bcrypt.genSalt(10)
        const hashedPassword = bcrypt.hash(newPassword, await salt)
        const updateUserResponse = await UserModel.updateUser({ id: userResponse.data.id, password: await hashedPassword, passwordChangedAt: new Date() })

        if (updateUserResponse.error) {
            return next(updateUserResponse.error)
        }

        if (!updateUserResponse.data) {
            return next(new HttpError(500, 'No se pudo actualizar el usuario'))
        }

        const deletePasswordResetResponse = await PasswordResetModel.deletePasswordReset({ id: passwordResetResponse.data.id })

        if (deletePasswordResetResponse.error) {
            return next(deletePasswordResetResponse.error)
        }

        console.log(deletePasswordResetResponse.data)

        const sendEmailResult = await emailService.sendChangedPasswordEmail(String(process.env.EMAIL_FROM), updateUserResponse.data)

        if (sendEmailResult.error) {
            console.error(sendEmailResult.error)
        }

        console.log(sendEmailResult.data)

        return res.status(200).json({ ...toCamelCase(updateUserResponse.data), password: undefined, passwordChangedAt: undefined })
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

    if (result.error) {
        return next(result.error)
    }

    const { password, newPassword, confirmNewPassword } = result.data
    const { id } = req.payload

    if (!password || (newPassword !== confirmNewPassword) || (password === newPassword)) {
        return next(new HttpError(400, 'Solicitud incorrecta'))
    }

    const userResponse = await UserModel.getUser({ id })

    if (userResponse.error) {
        return next(userResponse.error)
    }

    if (userResponse.data && (await bcrypt.compare(password, userResponse.data.password))) {
        const salt = bcrypt.genSalt(10)
        const hashedPassword = bcrypt.hash(newPassword, await salt)
        const updateUserResponse = await UserModel.updateUser({ id: userResponse.data.id, password: await hashedPassword, passwordChangedAt: new Date() })

        if (updateUserResponse.error) {
            return next(updateUserResponse.error)
        }

        if (!updateUserResponse.data) {
            return next(new HttpError(500, 'No se pudo actualizar el usuario'))
        }

        const sendEmailResult = await emailService.sendChangedPasswordEmail(String(process.env.EMAIL_FROM), updateUserResponse.data)

        if (sendEmailResult.error) {
            console.error(sendEmailResult.error)
        }

        console.log(sendEmailResult.data)

        const payload = { id: updateUserResponse.data.id, email: updateUserResponse.data.email, username: updateUserResponse.data.username, name: updateUserResponse.data.name }
        const isMobile = req.headers['x-client-platform'] === 'ios' || req.headers['x-client-platform'] === 'android'
        const expiresIn = isMobile ? '7d' : '6h'
        const authToken = jwt.sign(
            payload,
            String(process.env.AUTH_TOKEN_SECRET),
            { algorithm: 'HS256', expiresIn }
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
    forgotPassword,
    resetPassword,
    changePassword,
    verify
}
