import helloWorldoutes from './helloWorld.routes'
import { Express } from 'express'

export default (app: Express) => {
	app.use('/', helloWorldoutes)
}
