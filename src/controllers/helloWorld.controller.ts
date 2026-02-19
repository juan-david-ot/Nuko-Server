import { Request, Response } from 'express'

function helloWorld(req: Request, res: Response) {
	console.log('Hello World!!')
	res.send('Hello World!!')
}

export { helloWorld }
