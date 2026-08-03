import type { Core, DBCore, DBResponse, DBUser, PartialCore } from '../definitions/types.ts'
import pg from '../db/index.ts'
import { DBError } from '../error-handler/db.error.ts'

async function getCores(searchCore: PartialCore): Promise<DBResponse<DBCore[]>> {
    let query = 'SELECT * FROM cores'
    const values: unknown[] = []
    let isFirstCondition = true

    if (searchCore.id) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} id = $${values.length + 1}`
        )
        values.push(searchCore.id)
        isFirstCondition = false
    }

    if (searchCore.name) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} name = $${values.length + 1}`
        )
        values.push(searchCore.name)
        isFirstCondition = false
    }

    if (searchCore.creatorId) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} creator_id = $${values.length + 1}`
        )
        values.push(searchCore.creatorId)
    }

    return pg
        .query(query, values)
        .then((result) => ({ data: result.rows, error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function getCoresByUserId(userId: string): Promise<DBResponse<DBCore[]>> {
    return pg
        .query(
            `
                SELECT c.id, c.name, c.creator_id, c.created_at
                FROM cores_users cu
                INNER JOIN cores c ON cu.core_id = c.id
                WHERE cu.user_id = $1
            `,
            [userId]
        )
        .then((result) => ({ data: result.rows, error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function getCore(searchCore: PartialCore): Promise<DBResponse<DBCore>> {
    let query = 'SELECT * FROM cores'
    const values: unknown[] = []
    let isFirstCondition = true

    if (searchCore.id) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} id = $${values.length + 1}`
        )
        values.push(searchCore.id)
        isFirstCondition = false
    }

    if (searchCore.name) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} name = $${values.length + 1}`
        )
        values.push(searchCore.name)
        isFirstCondition = false
    }

    if (searchCore.creatorId) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} creator_id = $${values.length + 1}`
        )
        values.push(searchCore.creatorId)
    }

    return pg
        .query(`${query} LIMIT 1`, values)
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function saveCore(newCore: Core): Promise<DBResponse<DBCore>> {
    return pg
        .query(
            `
                INSERT INTO cores (name, creator_id)
                VALUES ($1, $2)
                RETURNING id, name, creator_id, created_at
            `,
            [newCore.name, newCore.creatorId]
        )
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function getUsersFromCore(coreId: string): Promise<DBResponse<DBUser[]>> {
    return pg
        .query(
            `
                SELECT
                    cu.joined_at,
                    u.id,
                    u.email,
                    u.username,
                    u.name,
                    u.surname
                FROM cores_users cu
                INNER JOIN users u ON cu.user_id = u.id
                WHERE cu.core_id = $1
            `,
            [coreId]
        )
        .then((result) => ({ data: result.rows, error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function addUserToCore(coreId: string, userId: string, roleId: string): Promise<DBResponse<DBUser>> {
    return pg
        .query(
            `
                INSERT INTO cores_users (core_id, user_id, role_id)
                VALUES ($1, $2, $3)
                RETURNING *
            `,
            [coreId, userId, roleId]
        )
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

export {
    getCores,
    getCoresByUserId,
    getCore,
    saveCore,
    getUsersFromCore,
    addUserToCore
}
