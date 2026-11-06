import type { Express } from 'express'
import authRouter from './auth.router.ts'
import userRouter from './user.router.ts'
import coreRouter from './core.router.ts'
import taskListRouter from './task-list.router.ts'

export default (app: Express): void => {
    app.use('/auth', authRouter)
    app.use('/users', userRouter)
    app.use('/cores', coreRouter)
    app.use('/task-lists', taskListRouter)
}
