import { NextFunction, Request, Response } from 'express'
import crypto from 'node:crypto'
import { User } from '../definitions/types.ts'
import { UserModel } from '../models/index.ts'
import { userSchema } from '../schemas/user.schema.ts'

async function test(req: Request, res: Response, next: NextFunction) {

    // const { user } = res.locals
    // if (!user) res.send('Access Denied')

    // console.log('user', user)

    const userData: User = { id: crypto.randomUUID(), name: 'test', username: 'test', email: 'test@example.com', password: 'password123' }

    const promise = userSchema.safeParseAsync(userData)

    const users = await UserModel.getUser({ username: 'test' })
    console.log('Users:', users)

    console.log('Test!!')

    const response = await promise

    if (response.success) {
        console.log('Validation successful:')

        const newUser = response.data

        console.log('New User:', newUser)
    }
    else if (!response.success) {
        return next(new Error('Validation failed')) // TODO: usar ZodError
    }

    return res.status(200).json(users)
}

export {
    test
}
