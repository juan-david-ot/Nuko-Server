export class DBError extends Error {
    statusCode: number
    originalError: Error

    constructor(originalError: Error) {
        super('No se pudo completar la operacion')
        this.statusCode = 500
        this.originalError = originalError

        Object.setPrototypeOf(this, DBError.prototype)
    }
}
