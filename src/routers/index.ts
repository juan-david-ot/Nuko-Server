import { Express } from 'express'
import authRouter from './auth.router'
import coreRouter from './core.router'
import helloWorlRouter from './hello-world.router'
import testRouter from './test.router'

export default (app: Express): void => {
    app.use('/api/auth', authRouter)
    app.use('/api/cores', coreRouter)
    app.use('/', helloWorlRouter)
    app.use('/test', testRouter)
}
