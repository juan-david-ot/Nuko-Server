import { Express } from 'express'
import helloWorlRoutes from './hello-world.routes'

export default (app: Express) => {
	app.use('/', helloWorlRoutes)
}
