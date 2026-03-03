import { Express } from 'express'
import helloWorlRoutes from './hello-world.router'
import testRoutes from './test.router'

export default (app: Express) => {
    app.use('/', helloWorlRoutes)
    app.use('/test', testRoutes)
}
