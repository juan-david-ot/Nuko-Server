import pg from '../db/index.ts'
import type { DBResponse, DBTaskList, PartialTaskList, TaskList } from '../definitions/types.ts'
import { DBError } from '../error-handler/db.error.ts'

async function getTaskLists(searchTaskList: PartialTaskList) {
    let query = 'SELECT * FROM task_lists'
    const values: unknown[] = []
    let isFirstCondition = true

    if (searchTaskList.id !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}id = $${values.length + 1}`
        )
        values.push(searchTaskList.id)
        isFirstCondition = false
    }

    if (searchTaskList.coreId !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}core_id = $${values.length + 1}`
        )
        values.push(searchTaskList.coreId)
        isFirstCondition = false
    }

    if (searchTaskList.name !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}name = $${values.length + 1}`
        )
        values.push(searchTaskList.name)
        isFirstCondition = false
    }

    if (searchTaskList.icon !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}icon = $${values.length + 1}`
        )
        values.push(searchTaskList.icon)
        isFirstCondition = false
    }

    if (searchTaskList.color !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}color = $${values.length + 1}`
        )
        values.push(searchTaskList.color)
        isFirstCondition = false
    }

    if (searchTaskList.position !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}position = $${values.length + 1}`
        )
        values.push(searchTaskList.position)
        isFirstCondition = false
    }

    if (searchTaskList.creatorId !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}creator_id = $${values.length + 1}`
        )
        values.push(searchTaskList.creatorId)
        isFirstCondition = false
    }

    if (searchTaskList.isArchived !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}archived_at IS ${searchTaskList.isArchived ? 'NOT ' : ''}NULL`
        )
    }

    return pg
        .query(query, values)
        .then((result) => ({ data: result.rows, error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function getTaskList() {

}

async function saveTaskList(newTaskList: TaskList): Promise<DBResponse<DBTaskList>> {
    return pg
        .query(
            `
                INSERT INTO task_lists (
                    core_id,
                    name,
                    icon,
                    color,
                    creator_id
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `,
            [
                newTaskList.coreId,
                newTaskList.name,
                newTaskList.icon,
                newTaskList.color,
                newTaskList.creatorId
            ]
        )
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function updateTaskList() {

}

async function deleteTaskList() {

}

export {
    getTaskLists,
    getTaskList,
    saveTaskList,
    updateTaskList,
    deleteTaskList
}
