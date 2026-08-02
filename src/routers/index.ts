import { Express } from 'express'
import authRouter from './auth.router.ts'
import coreRouter from './core.router.ts'
import helloWorlRouter from './hello-world.router.ts'
import testRouter from './test.router.ts'

export default (app: Express): void => {
    app.use('/api/auth', authRouter)
    app.use('/api/cores', coreRouter)
    app.use('/', helloWorlRouter)
    app.use('/test', testRouter)
}
