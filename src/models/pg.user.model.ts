import { PartialUser, User } from '../definitions/types'
import pg from '../db/pg-index'
import { QueryResult } from 'pg'

async function getUsers(searchUser: PartialUser): Promise<QueryResult<User>> {
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

    return pg.query(query, values)
}

async function getUser(searchUser: PartialUser): Promise<QueryResult<User>> {
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

    return pg.query(`${query} LIMIT 1`, values)
}

async function saveUser(newUser: User): Promise<QueryResult<any>> {
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
    return pg.query(
        query,
        [
            newUser.email,
            newUser.username,
            newUser.password,
            newUser.name,
            newUser.surname
        ]
    )
}

export {
    getUsers,
    getUser,
    saveUser
}
