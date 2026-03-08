import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

async function helloWorld(req: Request, res: Response, next: NextFunction) {
    try {
        const user = { id: 10, username: 'Dixamo', avatar: '' }
        const token = jwt.sign(
            { id: 10, username: 'Dixamo' },
            process.env.TOKEN_SECRET as string,
            { expiresIn: '6h' }
        )
        console.log('Hello World!!')
        return res
            .cookie(
                'access_token',
                token,
                {
                    httpOnly: true
                }
            )
            .send({ user, token })
    }
    catch (error) {
        return next(error)
    }
}

export {
    helloWorld
}
