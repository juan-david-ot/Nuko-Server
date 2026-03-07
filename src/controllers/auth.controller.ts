import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { validateUser } from '../schemas/user.schema'
import UserModel from '../models/user.model'

async function signup(req: Request, res: Response, next: NextFunction) {
    console.log('signup', req.body)
    const result = await validateUser(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const salt = bcrypt.genSalt(10)
    const hashedPassword = bcrypt.hash(result.data.password, await salt)
    const newUser = { ...result.data, password: await hashedPassword }

    const { data, error } = await UserModel.saveUser(newUser)

    if (error) {
        next(error)
    }

    return res.status(201).json(data)
}

async function login(req: Request, res: Response, next: NextFunction) {
    console.log('login')
}

async function verify(req: Request, res: Response, next: NextFunction) {
    console.log('verify')
}

export {
    signup,
    login,
    verify
}
