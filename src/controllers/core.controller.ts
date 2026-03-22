import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { coreSchema } from '../schemas/core.schema'
import CoreModel from '../models/core.model'
import { HttpError } from '../error-handler/http.error'

async function getUserCores(req: Request, res: Response, next: NextFunction) {
    const { data: coresData, error: coresError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresError) {
        return next(coresError)
    }

    const cores = coresData.map(item => item.cores)
    console.log(coresData)

    return res.status(200).json(cores)
}

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

    const { data: newCoreUserData, error: newCoreUserError } = await CoreModel.addUserToCore(newCoreData.id, req.payload.id)

    if (newCoreUserError) {
        return next(newCoreUserError)
    }

    return res.status(201).json({ newCoreData, newCoreUserData })
}

async function createInvitationToCore(req: Request, res: Response, next: NextFunction) {
    const { id: hostId, email, username } = req.payload
    const { id: coreId } = req.params

    const { data: coresData, error: coresError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresError) {
        return next(coresError)
    }

    if (!coresData.some(item => item.cores.id === coreId)) {
        return next(new HttpError(401, 'Unauthorized'))
    }

    console.log(hostId, email, username, coreId)

    const payload = { hostId, coreId }

    const inviteToken = jwt.sign(
        payload,
        String(process.env.TOKEN_SECRET),
        { algorithm: 'HS256', expiresIn: '12h' }
    )
    const inviteLink = `${process.env.ORIGIN}/invite/${inviteToken}`

    return res.status(201).json({ inviteLink })
}

export {
    getUserCores,
    createCore,
    createInvitationToCore
}
