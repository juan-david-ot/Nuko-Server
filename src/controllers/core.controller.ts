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

    const cores = coresData.map((item: any) => item.cores)

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
    const { id: hostId } = req.payload
    const { id: coreId } = req.params

    const { data: coresData, error: coresError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresError) {
        return next(coresError)
    }

    if (!coresData.some((item: any) => item.cores.id === coreId)) {
        return next(new HttpError(401, 'Unauthorized'))
    }

    const payload = { hostId, coreId }

    const inviteToken = jwt.sign(
        payload,
        String(process.env.TOKEN_SECRET),
        { algorithm: 'HS256', expiresIn: '12h' }
    )
    const inviteLink = `${process.env.ORIGIN}/invite/${inviteToken}`

    return res.status(201).json({ inviteLink })
}

async function acceptInvitationToCore(req: Request, res: Response, next: NextFunction) {
    const { id: guestId } = req.payload
    const { token: invitationToken } = req.params
    const decoded: any = jwt.verify(String(invitationToken), String(process.env.TOKEN_SECRET), (error, verified) => ({ error, verified }))

    if (decoded.error) {
        return next(new HttpError(401, 'Invitacion caducada o invalida'))
    }

    const { data: coreData, error: coreError } = await CoreModel.getCore({ id: decoded.verified.coreId })

    if (coreError) {
        return next(coreError)
    }

    const { data: newCoreUserData, error: newCoreUserError } = await CoreModel.addUserToCore(coreData.id, guestId)

    if (newCoreUserError) {
        return next(newCoreUserError)
    }

    return res.status(201).json({ coreData, newCoreUserData })
}

export {
    getUserCores,
    createCore,
    createInvitationToCore,
    acceptInvitationToCore
}
