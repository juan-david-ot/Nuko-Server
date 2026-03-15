import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { partialUserSchema, userSchema } from '../schemas/user.schema'
import * as UserModel from '../models/user.model'
import { HttpError } from '../error-handler/http.error'

async function signUp(req: Request, res: Response, next: NextFunction) {
    const result = await userSchema.safeParseAsync(req.body)

    if (!result.success) {
        return next(result.error)
    }

    const emailQuery = UserModel.getUsers({ email: result.data.email })
    const usernameQuery = UserModel.getUsers({ username: result.data.username })

    const [
        { data: emailQueryData, error: emailQueryError },
        { data: usernameQueryData, error: usernameQueryError }
    ] = await Promise.all([emailQuery, usernameQuery])

    if (emailQueryError || usernameQueryError) {
        return next(emailQueryError || usernameQueryError)
    }

    if (emailQueryData?.length > 0 || usernameQueryData?.length > 0) {
        return next(new HttpError(400, 'Email or username already exist'))
    }

    const salt = bcrypt.genSalt(10)
    const hashedPassword = bcrypt.hash(result.data.password, await salt)
    const newUser = { ...result.data, password: await hashedPassword }

    const { data: newUserData, error: newUserError } = await UserModel.saveUser(newUser)

    if (newUserError) {
        return next(newUserError)
    }

    return res.status(201).json({ ...newUserData[0], password: undefined })
}

async function logIn(req: Request, res: Response, next: NextFunction) {
    const result = await partialUserSchema.safeParseAsync(req.body)

    if (!result.success) {
        return next(result.error)
    }

    const { email, username, password } = result.data

    if (!password || (!email && !username)) {
        return next(new HttpError(401, 'Bad request'))
    }

    if (!result.data.password) {
        return next(new HttpError(401, 'Invalid credentials'))
    }

    const queryParams = email ? { email } : { username }
    const { data: queryData, error: queryError } = await UserModel.getUsers(queryParams)

    if (queryError) {
        return next(queryError)
    }

    const user = queryData?.[0]

    if (user && (await bcrypt.compare(password, user.password))) {
        const payload = { id: user.id, email: user.email, username: user.username }
        const authToken = jwt.sign(
            payload,
            String(process.env.TOKEN_SECRET),
            { algorithm: 'HS256', expiresIn: '6h' }
        )
        return res.status(200).json({ authToken })
    }
    else {
        return next(new HttpError(401, 'Invalid credentials'))
    }
}

async function verify(req: Request, res: Response) {
    const authUser = req.payload

    res.status(200).json({ authUser })
}

export {
    signUp,
    logIn,
    verify
}
