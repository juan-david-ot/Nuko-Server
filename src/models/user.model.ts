import { DBResponse, PartialUser, User } from '../definitions/types'
import pg from '../db'
import { DBError } from '../error-handler/db.error'

async function getUsers(searchUser: PartialUser): Promise<DBResponse> {
    let query = 'SELECT * FROM users'
    const values: unknown[] = []
    let isFirstCondition = true

    if (searchUser.id) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} id = $${values.length + 1}`
        )
        values.push(searchUser.id)
        isFirstCondition = false
    }

    if (searchUser.email) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} email = $${values.length + 1}`
        )
        values.push(searchUser.email)
        isFirstCondition = false
    }

    if (searchUser.username) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} username = $${values.length + 1}`
        )
        values.push(searchUser.username)
        isFirstCondition = false
    }

    if (searchUser.name) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} LOWER(name) = $${values.length + 1}`
        )
        values.push(searchUser.name)
        isFirstCondition = false
    }

    if (searchUser.surname) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} LOWER(surname) = $${values.length + 1}`
        )
        values.push(searchUser.surname)
    }

    return pg
        .query(query, values)
        .then((result) => ({ data: result.rows, error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function getUser(searchUser: PartialUser): Promise<DBResponse> {
    let query = 'SELECT * FROM users'
    const values: unknown[] = []
    let isFirstCondition = true

    if (searchUser.id) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} id = $${values.length + 1}`
        )
        values.push(searchUser.id)
        isFirstCondition = false
    }

    if (searchUser.email) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} email = $${values.length + 1}`
        )
        values.push(searchUser.email)
        isFirstCondition = false
    }

    if (searchUser.username) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} username = $${values.length + 1}`
        )
        values.push(searchUser.username)
        isFirstCondition = false
    }

    if (searchUser.name) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} LOWER(name) = $${values.length + 1}`
        )
        values.push(searchUser.name)
        isFirstCondition = false
    }

    if (searchUser.surname) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '} LOWER(surname) = $${values.length + 1}`
        )
        values.push(searchUser.surname)
    }

    return pg
        .query(`${query} LIMIT 1`, values)
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function saveUser(newUser: User): Promise<DBResponse> {
    const query = `
        INSERT INTO users (
            email,
            username,
            password,
            name,
            surname
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `
    return pg
        .query(
            query,
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

export {
    getUsers,
    getUser,
    saveUser
}
