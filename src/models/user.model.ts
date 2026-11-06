import type { DBResponse, DBUser, PartialUser, User } from '../definitions/types.ts'
import pg from '../db/index.ts'
import { DBError } from '../error-handler/db.error.ts'

async function getUsers(searchUser: PartialUser): Promise<DBResponse<DBUser[]>> {
    let query = 'SELECT * FROM users'
    const values: unknown[] = []
    let isFirstCondition = true

    if (searchUser.id !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}id = $${values.length + 1}`
        )
        values.push(searchUser.id)
        isFirstCondition = false
    }

    if (searchUser.email !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}email = $${values.length + 1}`
        )
        values.push(searchUser.email)
        isFirstCondition = false
    }

    if (searchUser.username !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}username = $${values.length + 1}`
        )
        values.push(searchUser.username)
        isFirstCondition = false
    }

    if (searchUser.name !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}LOWER(name) = $${values.length + 1}`
        )
        values.push(searchUser.name)
        isFirstCondition = false
    }

    if (searchUser.surname !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}LOWER(surname) = $${values.length + 1}`
        )
        values.push(searchUser.surname)
    }

    return pg
        .query(query, values)
        .then((result) => ({ data: result.rows, error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function getUser(searchUser: PartialUser): Promise<DBResponse<DBUser>> {
    let query = 'SELECT * FROM users'
    const values: unknown[] = []
    let isFirstCondition = true

    if (searchUser.id !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}id = $${values.length + 1}`
        )
        values.push(searchUser.id)
        isFirstCondition = false
    }

    if (searchUser.email !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}email = $${values.length + 1}`
        )
        values.push(searchUser.email)
        isFirstCondition = false
    }

    if (searchUser.username !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}username = $${values.length + 1}`
        )
        values.push(searchUser.username)
        isFirstCondition = false
    }

    if (searchUser.name !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}LOWER(name) = $${values.length + 1}`
        )
        values.push(searchUser.name)
        isFirstCondition = false
    }

    if (searchUser.surname !== undefined) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}LOWER(surname) = $${values.length + 1}`
        )
        values.push(searchUser.surname)
    }

    return pg
        .query(`${query} LIMIT 1`, values)
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function saveUser(newUser: User): Promise<DBResponse<DBUser>> {
    return pg
        .query(
            `
                INSERT INTO users (
                    email,
                    username,
                    password,
                    name,
                    surname
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `,
            [
                newUser.email,
                newUser.username,
                newUser.password,
                newUser.name,
                newUser.surname
            ]
        )
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function updateUser(updateUser: PartialUser): Promise<DBResponse<DBUser>> {
    let query = 'UPDATE users SET'
    const values: unknown[] = []
    let isFirstCondition = true

    if (updateUser.email !== undefined) {
        query = query.concat(` email = $${values.length + 1}`)
        values.push(updateUser.email)
        isFirstCondition = false
    }

    if (updateUser.username !== undefined) {
        query = query.concat(`${isFirstCondition ? ' ' : ' , '}username = $${values.length + 1}`)
        values.push(updateUser.username)
        isFirstCondition = false
    }

    if (updateUser.password !== undefined) {
        query = query.concat(`${isFirstCondition ? ' ' : ' , '}password = $${values.length + 1}`)
        values.push(updateUser.password)
        isFirstCondition = false
    }

    if (updateUser.name !== undefined) {
        query = query.concat(`${isFirstCondition ? ' ' : ' , '}name = $${values.length + 1}`)
        values.push(updateUser.name)
        isFirstCondition = false
    }

    if (updateUser.surname !== undefined) {
        query = query.concat(`${isFirstCondition ? ' ' : ' , '}surname = $${values.length + 1}`)
        values.push(updateUser.surname)
        isFirstCondition = false
    }

    if (updateUser.passwordChangedAt !== undefined) {
        query = query.concat(`${isFirstCondition ? ' ' : ' , '}password_changed_at = $${values.length + 1}`)
        values.push(updateUser.passwordChangedAt)
    }

    values.push(updateUser.id)

    return pg
        .query(`${query} WHERE id = $${values.length} RETURNING *`, values)
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function deleteUser() {

}

export {
    getUsers,
    getUser,
    saveUser,
    updateUser,
    deleteUser
}
