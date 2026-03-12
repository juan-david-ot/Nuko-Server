import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validatePartialUser, validateUser } from '../schemas/user.schema'
import UserModel from '../models/user.model'
import { HttpError } from '../error-handler'

async function signup(req: Request, res: Response, next: NextFunction) {
    const result = await validateUser(req.body)

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
        console.log(emailQueryError || usernameQueryError)
        return next(new HttpError(500, 'Internal Server Error'))
    }

    if (emailQueryData?.length > 0 || usernameQueryData?.length > 0) {
        return next(new HttpError(400, 'Email or username already exist'))
    }

    const salt = bcrypt.genSalt(10)
    const hashedPassword = bcrypt.hash(result.data.password, await salt)
    const newUser = { ...result.data, password: await hashedPassword }

    const { data: newUserData, error: newUserError } = await UserModel.saveUser(newUser)

    if (newUserError) {
        console.log(newUserError)
        return next(new HttpError(500, 'Internal Server Error'))
    }

    return res.status(201).json(newUserData)
}

async function login(req: Request, res: Response, next: NextFunction) {
    const result = await validatePartialUser(req.body)

    if (!result.success) {
        console.log(result.error)
        return next(new HttpError(400, result.error.issues[0]?.message))
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
        console.log(queryError)
        return next(new HttpError(500, 'Internal Server Error'))
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

async function verify(req: Request, res: Response, next: NextFunction) {
    const authUser = req.payload

    res.json({ authUser })
}

export {
    signup,
    login,
    verify
}
