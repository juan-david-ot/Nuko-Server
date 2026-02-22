import { Express } from 'express'
import helloWorlRoutes from './hello-world.routes'
import testRoutes from './test.routes'

export default (app: Express) => {
    app.use('/', helloWorlRoutes)
    app.use('/test', testRoutes)
}
