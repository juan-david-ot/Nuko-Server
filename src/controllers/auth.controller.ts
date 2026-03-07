import { NextFunction, Request, Response } from 'express'
import { validateUser } from '../schemas/user.schema'

async function signup(req: Request, res: Response, next: NextFunction) {
    console.log('signup', req.body)
    const result = await validateUser(req.body)
    console.log('result', result)
    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    console.log('result.data', result.data)
    const newUser = result.data
    console.log('newUser', newUser)
    return res.status(201).json(newUser)
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
