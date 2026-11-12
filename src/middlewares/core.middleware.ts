import type { NextFunction, Request, Response } from 'express'
import z from 'zod'
import coreService from '../services/core.service.ts'
import { HttpError } from '../error-handler/http.error.ts'

async function isUserInCore(req: Request, res: Response, next: NextFunction): Promise<void> {
    const result = await z.object({ coreId: z.uuid() }).safeParseAsync({ coreId: req.params.coreId })

    if (result.error) {
        return next(result.error)
    }

    const { coreId } = result.data

    const isUserInCore = await coreService.isUserInCore(req.payload.id, coreId)

    if (!isUserInCore) {
        return next(new HttpError(401, 'No tienes acceso a este nucleo'))
    }

    return next()
}

export {
    isUserInCore
}
