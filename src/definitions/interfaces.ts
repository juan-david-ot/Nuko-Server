import 'express'

declare module 'express' {
    interface Request {
        payload?: any
    }
}
