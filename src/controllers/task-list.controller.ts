import type { NextFunction, Request, Response } from 'express'
import z from 'zod'
import { taskListSchema } from '../schemas/task-list.schema.ts'
import { CoreModel, TaskListModel } from '../models/index.ts'
import { toCamelCase } from '../utils/index.ts'
import { HttpError } from '../error-handler/http.error.ts'

async function getTaskListsByCoreId(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await z.object({ coreId: z.uuid() }).safeParseAsync(req.params)

    if (result.error) {
        return next(result.error)
    }

    const { coreId } = result.data

    const userCoresResponse = await CoreModel.getCoresByUserId(req.payload.id)

    if (userCoresResponse.error) {
        return next(userCoresResponse.error)
    }

    if (userCoresResponse.data && !userCoresResponse.data.find((core: any) => core.id === coreId)) {
        return next(new HttpError(401, 'No tienes acceso a este nucleo'))
    }

    const taskListsResponse = await TaskListModel.getTaskLists({ coreId })

    if (taskListsResponse.error) {
        return next(taskListsResponse.error)
    }

    return res.status(200).json((taskListsResponse.data?.map((taskList: any) => toCamelCase(taskList)) ?? []))
}

async function createTaskList(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const result = await taskListSchema.safeParseAsync({ ...req.body, creatorId: req.payload.id })

    if (result.error) {
        return next(result.error)
    }

    const newTaskList = result.data

    const userCoresResponse = await CoreModel.getCoresByUserId(req.payload.id)

    if (userCoresResponse.error) {
        return next(userCoresResponse.error)
    }

    if (userCoresResponse.data && !userCoresResponse.data.find((core: any) => core.id === newTaskList.coreId)) {
        return next(new HttpError(401, 'No tienes acceso a este nucleo'))
    }

    const newTaskListResponse = await TaskListModel.saveTaskList(newTaskList)

    if (newTaskListResponse.error) {
        return next(newTaskListResponse.error)
    }

    if (!newTaskListResponse.data) {
        return next(new HttpError(500, 'No se pudo crear el nucleo'))
    }

    if (!newTaskListResponse.data.id) {
        return next(new HttpError(500, 'No se pudo obtener el identificador del nucleo'))
    }

    return res.status(200).json({ ...toCamelCase(newTaskListResponse.data) })
}

export {
    getTaskListsByCoreId,
    createTaskList
}
