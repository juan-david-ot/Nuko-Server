import { Express } from 'express'
import helloWorlRouter from './hello-world.router'
import testRouter from './test.router'

export default (app: Express) => {
    app.use('/', helloWorlRouter)
    app.use('/test', testRouter)
}
