import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const TOKEN_SECRET = process.env.TOKEN_SECRET || ''

export class HelloWorldController {
    static async helloWorld(req: Request, res: Response) {
        try {
            const user = { id: 10, username: 'Dixamo', avatar: '' }
            const token = jwt.sign(
                { id: 10, username: 'Dixamo' },
                TOKEN_SECRET,
                { expiresIn: '6h' }
            )
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
            res.status(401).send(error)
        }
        console.log('Hello World!!')
        return res.send('Hello World!!')
    }
}
