import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { coreSchema } from '../schemas/core.schema'
import { CoreModel } from '../models'
import { HttpError } from '../error-handler/http.error'

async function getUserCores(req: Request, res: Response, next: NextFunction) {
    const { data: coresQueryData, error: coresQueryError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresQueryError) {
        return next(coresQueryError)
    }

    const cores = coresQueryData.map((item: any) => ({ id: item.cores.id, name: item.cores.name, creatorId: item.cores.creator_id, createdAt: item.cores.created_at }))

    return res.status(200).json(cores)
}

async function getUserCoreById(req: Request, res: Response, next: NextFunction) {
    const { id: coreId } = req.params

    const { data: userCoresQueryData, error: userCoresQueryError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (userCoresQueryError) {
        return next(userCoresQueryError)
    }

    if (!userCoresQueryData.find((item: any) => item.cores.id === coreId)) {
        return next(new HttpError(401, 'No tienes acceso a este nucleo'))
    }

    const { data: coreQueryData, error: coreQueryError } = await CoreModel.getCore({ id: String(coreId) })

    if (coreQueryError) {
        return next(coreQueryError)
    }

    return res.status(200).json({ id: coreQueryData.id, name: coreQueryData.name, creatorId: coreQueryData.creator_id, createdAt: coreQueryData.created_at })
}

async function getUserCoreInformationById(req: Request, res: Response, next: NextFunction) {
    const { id: coreId } = req.params

    const { data: userCoresQueryData, error: userCoresQueryError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (userCoresQueryError) {
        return next(userCoresQueryError)
    }

    if (!userCoresQueryData.find((item: any) => item.cores.id === coreId)) {
        return next(new HttpError(401, 'No tienes acceso a este nucleo'))
    }

    const { data: coreQueryData, error: coreQueryError } = await CoreModel.getCore({ id: String(coreId) })

    if (coreQueryError) {
        return next(coreQueryError)
    }

    const { data: coreUsersQueryData, error: coreUsersQueryError } = await CoreModel.getUsersFromCore(String(coreId))

    if (coreUsersQueryError) {
        return next(coreUsersQueryError)
    }

    const coreUsers = coreUsersQueryData.map((item: any) => ({ ...item.users, joinedAt: item.joined_at }))

    console.log(coreQueryData)

    return res.status(200).json({ id: coreQueryData.id, name: coreQueryData.name, creatorId: coreQueryData.creator_id, createdAt: coreQueryData.created_at, users: coreUsers })
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
        return next(new HttpError(401, 'No autorizado'))
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
    const verified: any = jwt.verify(String(invitationToken), String(process.env.TOKEN_SECRET), (error, decoded) => ({ error, decoded }))

    if (verified.error) {
        return next(new HttpError(401, 'Invitacion caducada o invalida'))
    }

    const { data: coreData, error: coreError } = await CoreModel.getCore({ id: verified.decoded.coreId })

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
    getUserCoreById,
    getUserCoreInformationById,
    createCore,
    createInvitationToCore,
    acceptInvitationToCore
}
