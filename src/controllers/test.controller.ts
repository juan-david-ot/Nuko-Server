import { Request, Response } from 'express'

export function test(req: Request, res: Response) {
    console.log('Test!!')
    res.send('Test!!')
}
