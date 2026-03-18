import { NextFunction, Request, Response } from 'express'
import { coreSchema } from '../schemas/core.schema'
import CoreModel from '../models/core.model'

async function createCore(req: Request, res: Response, next: NextFunction) {
    const result = await coreSchema.safeParseAsync({ ...req.body, creatorId: req.payload.id })

    if (!result.success) {
        return next(result.error)
    }

    const newCore = result.data

    const { data: newCoreData, error: newCoreError } = await CoreModel.saveCore(newCore)

    if (newCoreError) {
        return next(newCoreError)
    }

    console.log(newCore)
    return res.status(201).json(newCoreData)
}

export {
    createCore
}
