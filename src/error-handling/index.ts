import { Express, Request, Response } from 'express'

export default (app: Express) => {
	app.use((req: Request, res: Response) => {
		res.status(404).json({ message: 'This route does not exist' })
	})

	app.use((error: Error, req: Request, res: Response) => {
		console.error('ERROR', req.method, req.path, error)

		res.status(500).json({
			message: 'Internal server error. Check the server console',
			error: error.message
		})
	})
}
