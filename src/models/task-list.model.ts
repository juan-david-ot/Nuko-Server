import pg from '../db/index.ts'
import type { DBResponse, DBTaskList, TaskList } from '../definitions/types.ts'
import { DBError } from '../error-handler/db.error.ts'

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

export {
    saveTaskList
}
