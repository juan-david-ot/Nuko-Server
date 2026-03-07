import { Express } from 'express'
import authRouter from './auth.router'
import helloWorlRouter from './hello-world.router'
import testRouter from './test.router'

export default (app: Express) => {
    app.use('/api/auth', authRouter)
    app.use('/', helloWorlRouter)
    app.use('/test', testRouter)
}
