import { Request, Response } from 'express'

export class HelloWorldController {
    static async helloWorld(req: Request, res: Response) {
        console.log('Hello World!!')
        res.send('Hello World!!')
    }
}
