import { NextFunction, Request, Response } from 'express'

async function signup(req: Request, res: Response, next: NextFunction) {
    console.log('signup')
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
