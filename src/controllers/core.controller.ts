import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import z from 'zod'
import { coreSchema } from '../schemas/core.schema'
import { CoreModel } from '../models'
import { HttpError } from '../error-handler/http.error'

async function getUserCores(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { data: coresQueryData, error: coresQueryError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresQueryError) {
        return next(coresQueryError)
    }

    const cores = coresQueryData?.map((core: any) => ({ id: core.id, name: core.name, creatorId: core.creator_id, createdAt: core.created_at })) ?? []

    return res.status(200).json(cores)
}

async function getUserCoreById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ id: z.uuid() }).safeParseAsync(req.params)

    if (!result.success) {
        return next(result.error)
    }

    const { id: coreId } = result.data

    const coreQuery = CoreModel.getCore({ id: String(coreId) })
    const { data: userCoresQueryData, error: userCoresQueryError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (userCoresQueryError) {
        return next(userCoresQueryError)
    }

    if (userCoresQueryData && !userCoresQueryData.find((core: any) => core.id === coreId)) {
        return next(new HttpError(401, 'No tienes acceso a este nucleo'))
    }

    const { data: coreQueryData, error: coreQueryError } = await coreQuery

    if (coreQueryError) {
        return next(coreQueryError)
    }

    if (!coreQueryData) {
        return next(new HttpError(404, 'Nucleo no encontrado'))
    }

    return res.status(200).json({ id: coreQueryData.id, name: coreQueryData.name, creatorId: coreQueryData.creator_id, createdAt: coreQueryData.created_at })
}

async function getUserCoreInformationById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ id: z.uuid() }).safeParseAsync(req.params)

    if (!result.success) {
        return next(result.error)
    }

    const { id: coreId } = result.data

    const coreQuery = CoreModel.getCore({ id: String(coreId) })
    const coreUsersQuery = CoreModel.getUsersFromCore(String(coreId))
    const { data: userCoresQueryData, error: userCoresQueryError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (userCoresQueryError) {
        return next(userCoresQueryError)
    }

    if (userCoresQueryData && !userCoresQueryData.find((core: any) => core.id === coreId)) {
        return next(new HttpError(401, 'No tienes acceso a este nucleo'))
    }

    const { data: coreQueryData, error: coreQueryError } = await coreQuery

    if (coreQueryError) {
        return next(coreQueryError)
    }

    if (!coreQueryData) {
        return next(new HttpError(404, 'Nucleo no encontrado'))
    }

    const { data: coreUsersQueryData, error: coreUsersQueryError } = await coreUsersQuery

    if (coreUsersQueryError) {
        return next(coreUsersQueryError)
    }

    const coreUsers = coreUsersQueryData?.map((user: any) => ({ ...user, joinedAt: user.joined_at })) ?? []

    return res.status(200).json({ id: coreQueryData.id, name: coreQueryData.name, creatorId: coreQueryData.creator_id, createdAt: coreQueryData.created_at, users: coreUsers })
}

async function createCore(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await coreSchema.safeParseAsync({ ...req.body, creatorId: req.payload.id })

    if (!result.success) {
        return next(result.error)
    }

    const newCore = result.data

    const { data: newCoreData, error: newCoreError } = await CoreModel.saveCore(newCore)

    if (newCoreError) {
        return next(newCoreError)
    }

    if (!newCoreData) {
        return next(new HttpError(500, 'No se pudo crear el nucleo'))
    }

    if (!newCoreData.id) {
        return next(new HttpError(500, 'No se pudo obtener el identificador del nucleo'))
    }

    const { data: newCoreUserData, error: newCoreUserError } = await CoreModel.addUserToCore(newCoreData.id, req.payload.id, '6e17aa28-2e12-4b9f-81da-6d3dc1f4ff03')

    if (newCoreUserError) {
        return next(newCoreUserError)
    }

    return res.status(201).json({ newCoreData, newCoreUserData })
}

async function createInvitationToCore(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ id: z.uuid() }).safeParseAsync(req.params)

    if (!result.success) {
        return next(result.error)
    }

    const { id: coreId } = result.data
    const { id: hostId } = req.payload

    const { data: coresData, error: coresError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresError) {
        return next(coresError)
    }

    if (coresData && !coresData.some((core: any) => core.id === coreId)) {
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

async function acceptInvitationToCore(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ token: z.jwt() }).safeParseAsync(req.params)

    if (!result.success) {
        return next(result.error)
    }

    const { token: invitationToken } = result.data
    const { id: guestId } = req.payload
    const verified: any = jwt.verify(String(invitationToken), String(process.env.TOKEN_SECRET), (error, decoded) => ({ error, decoded }))

    if (verified.error) {
        return next(new HttpError(401, 'Invitacion caducada o invalida'))
    }

    const { data: coreData, error: coreError } = await CoreModel.getCore({ id: verified.decoded.coreId })

    if (coreError) {
        return next(coreError)
    }

    if (!coreData) {
        return next(new HttpError(404, 'Nucleo no encontrado'))
    }

    if (!coreData.id) {
        return next(new HttpError(500, 'No se pudo obtener el identificador del nucleo'))
    }

    const { data: newCoreUserData, error: newCoreUserError } = await CoreModel.addUserToCore(coreData.id, guestId, '1b01156b-e6c2-458d-b488-12d44c38e1f3')

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
