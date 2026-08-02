import { Express } from 'express'
import authRouter from './auth.router.ts'
import coreRouter from './core.router.ts'

export default (app: Express): void => {
    app.use('/auth', authRouter)
    app.use('/cores', coreRouter)
}
