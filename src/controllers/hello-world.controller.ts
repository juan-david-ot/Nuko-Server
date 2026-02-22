import { Request, Response } from 'express'

export function helloWorld(req: Request, res: Response) {
    console.log('Hello World!!')
    res.send('Hello World!!')
}
