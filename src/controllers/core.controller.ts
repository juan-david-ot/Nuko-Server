import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import z from 'zod'
import { coreSchema } from '../schemas/core.schema.ts'
import { CoreModel, UserModel } from '../models/index.ts'
import { toCamelCase } from '../utils/index.ts'
import { HttpError } from '../error-handler/http.error.ts'

async function getUserCores(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const coresResponse = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresResponse.error) {
        return next(coresResponse.error)
    }

    const cores = coresResponse.data?.map((core: any) => toCamelCase(core)) ?? []

    return res.status(200).json(cores)
}

async function getUserCoreById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ id: z.uuid() }).safeParseAsync(req.params)

    if (result.error) {
        return next(result.error)
    }

    const { id: coreId } = result.data

    const coreQuery = CoreModel.getCore({ id: String(coreId) })
    const userCoresResponse = await CoreModel.getCoresByUserId(req.payload.id)

    if (userCoresResponse.error) {
        return next(userCoresResponse.error)
    }

    if (userCoresResponse.data && !userCoresResponse.data.find((core: any) => core.id === coreId)) {
        return next(new HttpError(401, 'No tienes acceso a este nucleo'))
    }

    const coreResponse = await coreQuery

    if (coreResponse.error) {
        return next(coreResponse.error)
    }

    if (!coreResponse.data) {
        return next(new HttpError(404, 'Nucleo no encontrado'))
    }

    return res.status(200).json(toCamelCase(coreResponse.data))
}

async function getUserCoreInformationById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ id: z.uuid() }).safeParseAsync(req.params)

    if (result.error) {
        return next(result.error)
    }

    const { id: coreId } = result.data

    const coreQuery = CoreModel.getCore({ id: String(coreId) })
    const coreUsersQuery = CoreModel.getUsersFromCore(String(coreId))
    const userCoresResponse = await CoreModel.getCoresByUserId(req.payload.id)

    if (userCoresResponse.error) {
        return next(userCoresResponse.error)
    }

    if (userCoresResponse.data && !userCoresResponse.data.find((core: any) => core.id === coreId)) {
        return next(new HttpError(401, 'No tienes acceso a este nucleo'))
    }

    const coreResponse = await coreQuery

    if (coreResponse.error) {
        return next(coreResponse.error)
    }

    if (!coreResponse.data) {
        return next(new HttpError(404, 'Nucleo no encontrado'))
    }

    const coreUsersResponse = await coreUsersQuery

    if (coreUsersResponse.error) {
        return next(coreUsersResponse.error)
    }

    const coreUsers = coreUsersResponse.data?.map((user: any) => toCamelCase(user)) ?? []

    return res.status(200).json({ ...toCamelCase(coreResponse.data), users: coreUsers })
}

async function createCore(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await coreSchema.safeParseAsync({ ...req.body, creatorId: req.payload.id })

    if (result.error) {
        return next(result.error)
    }

    const newCore = result.data

    const newCoreResponse = await CoreModel.saveCore(newCore)

    if (newCoreResponse.error) {
        return next(newCoreResponse.error)
    }

    if (!newCoreResponse.data) {
        return next(new HttpError(500, 'No se pudo crear el nucleo'))
    }

    if (!newCoreResponse.data.id) {
        return next(new HttpError(500, 'No se pudo obtener el identificador del nucleo'))
    }

    const newCoreUserResponse = await CoreModel.addUserToCore(newCoreResponse.data.id, req.payload.id, '6e17aa28-2e12-4b9f-81da-6d3dc1f4ff03')

    if (newCoreUserResponse.error) {
        return next(newCoreUserResponse.error)
    }

    if (!newCoreUserResponse.data) {
        return next(new HttpError(500, 'No se pudo obtener la informacion'))
    }

    return res.status(201).json({
        newCore: toCamelCase(newCoreResponse.data),
        newCoreUser: toCamelCase(newCoreUserResponse.data)
    })
}

async function createInvitationToCore(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ id: z.uuid() }).safeParseAsync(req.params)

    if (result.error) {
        return next(result.error)
    }

    const { id: coreId } = result.data
    const { id: hostId } = req.payload

    const coresResponse = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresResponse.error) {
        return next(coresResponse.error)
    }

    if (coresResponse.data && !coresResponse.data.some((core: any) => core.id === coreId)) {
        return next(new HttpError(401, 'No autorizado'))
    }

    const payload = { hostId, coreId }

    const inviteToken = jwt.sign(
        payload,
        String(process.env.TOKEN_SECRET),
        { algorithm: 'HS256', expiresIn: '12h' }
    )
    const inviteLink = `${String(process.env.ORIGIN)}/invite/${inviteToken}`

    return res.status(201).json({ inviteLink })
}

async function decodeInvitationToCore(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ token: z.jwt() }).safeParseAsync(req.params)

    if (result.error) {
        return next(result.error)
    }

    const { token: invitationToken } = result.data
    const verified: any = jwt.verify(String(invitationToken), String(process.env.TOKEN_SECRET), (error, decoded) => ({ error, decoded }))

    if (verified.error) {
        return next(new HttpError(401, 'Invitacion caducada o invalida'))
    }

    const userQuery = UserModel.getUser({ id: verified.decoded.hostId })
    const coreQuery = CoreModel.getCore({ id: verified.decoded.coreId })

    const [userResponse, coreResponse] = await Promise.all([userQuery, coreQuery])

    if (userResponse.error || coreResponse.error) {
        return next(userResponse.error || coreResponse.error)
    }

    if (!userResponse.data) {
        return next(new HttpError(500, 'No se pudo obtener el usuario'))
    }

    if (!coreResponse.data) {
        return next(new HttpError(500, 'No se pudo obtener el nucleo'))
    }

    return res.status(200).json({
        core: toCamelCase(coreResponse.data),
        hostUser: { ...toCamelCase(userResponse.data), password: undefined, passwordChangedAt: undefined }
    })
}

async function acceptInvitationToCore(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ token: z.jwt() }).safeParseAsync(req.params)

    if (result.error) {
        return next(result.error)
    }

    const { token: invitationToken } = result.data
    const { id: guestId } = req.payload
    const verified: any = jwt.verify(String(invitationToken), String(process.env.TOKEN_SECRET), (error, decoded) => ({ error, decoded }))

    if (verified.error) {
        return next(new HttpError(401, 'Invitacion caducada o invalida'))
    }

    const coreResponse = await CoreModel.getCore({ id: verified.decoded.coreId })

    if (coreResponse.error) {
        return next(coreResponse.error)
    }

    if (!coreResponse.data) {
        return next(new HttpError(404, 'Nucleo no encontrado'))
    }

    if (!coreResponse.data.id) {
        return next(new HttpError(500, 'No se pudo obtener el identificador del nucleo'))
    }

    const newCoreUserResponse = await CoreModel.addUserToCore(coreResponse.data.id, guestId, '1b01156b-e6c2-458d-b488-12d44c38e1f3')

    if (newCoreUserResponse.error) {
        return next(newCoreUserResponse.error)
    }

    if (!newCoreUserResponse.data) {
        return next(new HttpError(500, 'No se pudo obtener la informacion'))
    }

    return res.status(201).json({
        core: toCamelCase(coreResponse.data),
        newCoreUser: toCamelCase(newCoreUserResponse.data)
    })
}

export {
    getUserCores,
    getUserCoreById,
    getUserCoreInformationById,
    createCore,
    createInvitationToCore,
    decodeInvitationToCore,
    acceptInvitationToCore
}
