import type { NextFunction, Request, Response } from 'express'
import z from 'zod'
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

export {
    getTaskListsByCoreId
}
