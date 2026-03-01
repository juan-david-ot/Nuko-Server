import { NextFunction, Request, Response } from 'express'
import crypto from 'node:crypto'
import { User } from '../definitions/types'
import { UserModel } from '../models/user.model'
import { validateUser } from '../schemas/user.schema'

export class TestController {
    static async test(req: Request, res: Response, next: NextFunction) {

        // const { user } = res.locals
        // if (!user) res.send('Access Denied')

        // console.log('user', user)

        const userData: User = { id: crypto.randomUUID(), name: 'test', nickname: 'test', email: 'test@example.com', password: 'password123' }

        const promise = validateUser(userData)

        const users = await UserModel.getUsers()
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

        return res.send('Test!!')
    }
}
