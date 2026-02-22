import { NextFunction, Request, Response } from 'express'
import crypto from 'node:crypto'
import { User, validateUser } from '../models/user.schema'

export async function test(req: Request, res: Response, next: NextFunction) {

    const userData: User = { id: crypto.randomUUID(), name: 'test', nickname: 'test', email: 'test@example.com', password: 'password123' }

    const promise = validateUser(userData)

    console.log('Test!!')

    const response = await promise

    if (response.success) {
        console.log('Validation successful:')

        const newUser = response.data

        console.log('New User:', newUser)
    }
    else if (!response.success) {
        console.error('Validation failed:', response.error.issues.map(issue => issue.message))
        next(new Error('Validation failed'))
    }

    res.send('Test!!')
}
