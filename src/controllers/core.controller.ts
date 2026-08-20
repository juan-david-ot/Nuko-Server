import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import z from 'zod'
import { coreSchema } from '../schemas/core.schema.ts'
import { CoreModel, UserModel } from '../models/index.ts'
import { toCamelCase } from '../utils/index.ts'
import { HttpError } from '../error-handler/http.error.ts'

async function getUserCores(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { data: coresQueryData, error: coresQueryError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresQueryError) {
        return next(coresQueryError)
    }

    const cores = coresQueryData?.map((core: any) => toCamelCase(core)) ?? []

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

    return res.status(200).json(toCamelCase(coreQueryData))
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

    const coreUsers = coreUsersQueryData?.map((user: any) => toCamelCase(user)) ?? []

    return res.status(200).json({ ...toCamelCase(coreQueryData), users: coreUsers })
}

async function createCore(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await coreSchema.safeParseAsync({ ...req.body, creatorId: req.payload.id })

    if (!result.success) {
        return next(result.error)
    }

    const newCore = result.data

    const { data: newCoreQueryData, error: newCoreQueryError } = await CoreModel.saveCore(newCore)

    if (newCoreQueryError) {
        return next(newCoreQueryError)
    }

    if (!newCoreQueryData) {
        return next(new HttpError(500, 'No se pudo crear el nucleo'))
    }

    if (!newCoreQueryData.id) {
        return next(new HttpError(500, 'No se pudo obtener el identificador del nucleo'))
    }

    const { data: newCoreUserQueryData, error: newCoreUserQueryError } = await CoreModel.addUserToCore(newCoreQueryData.id, req.payload.id, '6e17aa28-2e12-4b9f-81da-6d3dc1f4ff03')

    if (newCoreUserQueryError) {
        return next(newCoreUserQueryError)
    }

    if (!newCoreUserQueryData) {
        return next(new HttpError(500, 'No se pudo obtener la informacion'))
    }

    return res.status(201).json({
        newCore: toCamelCase(newCoreQueryData),
        newCoreUser: toCamelCase(newCoreUserQueryData)
    })
}

async function createInvitationToCore(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ id: z.uuid() }).safeParseAsync(req.params)

    if (!result.success) {
        return next(result.error)
    }

    const { id: coreId } = result.data
    const { id: hostId } = req.payload

    const { data: coresQueryData, error: coresQueryError } = await CoreModel.getCoresByUserId(req.payload.id)

    if (coresQueryError) {
        return next(coresQueryError)
    }

    if (coresQueryData && !coresQueryData.some((core: any) => core.id === coreId)) {
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

    if (!result.success) {
        return next(result.error)
    }

    const { token: invitationToken } = result.data
    const verified: any = jwt.verify(String(invitationToken), String(process.env.TOKEN_SECRET), (error, decoded) => ({ error, decoded }))

    if (verified.error) {
        return next(new HttpError(401, 'Invitacion caducada o invalida'))
    }

    const userQuery = UserModel.getUser({ id: verified.decoded.hostId })
    const coreQuery = CoreModel.getCore({ id: verified.decoded.coreId })

    const [
        { data: userQueryData, error: userQueryError },
        { data: coreQueryData, error: coreQueryError }
    ] = await Promise.all([userQuery, coreQuery])

    if (userQueryError || coreQueryError) {
        return next(userQueryError || coreQueryError)
    }

    if (!userQueryData) {
        return next(new HttpError(500, 'No se pudo obtener el usuario'))
    }

    if (!coreQueryData) {
        return next(new HttpError(500, 'No se pudo obtener el nucleo'))
    }

    return res.status(200).json({
        core: toCamelCase(coreQueryData),
        hostUser: { ...toCamelCase(userQueryData), password: undefined }
    })
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

    const { data: coreQueryData, error: coreQueryError } = await CoreModel.getCore({ id: verified.decoded.coreId })

    if (coreQueryError) {
        return next(coreQueryError)
    }

    if (!coreQueryData) {
        return next(new HttpError(404, 'Nucleo no encontrado'))
    }

    if (!coreQueryData.id) {
        return next(new HttpError(500, 'No se pudo obtener el identificador del nucleo'))
    }

    const { data: newCoreUserQueryData, error: newCoreUserQueryError } = await CoreModel.addUserToCore(coreQueryData.id, guestId, '1b01156b-e6c2-458d-b488-12d44c38e1f3')

    if (newCoreUserQueryError) {
        return next(newCoreUserQueryError)
    }

    if (!newCoreUserQueryData) {
        return next(new HttpError(500, 'No se pudo obtener la informacion'))
    }

    return res.status(201).json({
        core: toCamelCase(coreQueryData),
        newCoreUser: toCamelCase(newCoreUserQueryData)
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
