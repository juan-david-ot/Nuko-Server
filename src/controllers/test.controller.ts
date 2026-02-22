import { NextFunction, Request, Response } from 'express'
import crypto from 'node:crypto'
import { UserSchema } from '../models/user.schema'

export async function test(req: Request, res: Response, next: NextFunction) {
    const promise = UserSchema.safeParseAsync({ id: crypto.randomUUID(), name: '', nickname: 'test', email: 'test@example.com', password: 'password123' })

    const response = await promise

    if (response.success) {
        console.log('Validation successful:', response.data)
    }
    else if (!response.success) {
        console.error('Validation failed:', response.error.issues.map(issue => issue.message))
        next(new Error('Validation failed'))
    }

    console.log('Test!!')
    res.send('Test!!')
}
