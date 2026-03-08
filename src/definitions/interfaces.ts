declare module 'express' {
    interface Request {
        payload?: undefined
    }
}

export interface TestInterface {
    test: string
}
