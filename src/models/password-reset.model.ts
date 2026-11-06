import type { DBPasswordReset, DBResponse, PasswordReset } from '../definitions/types.ts'
import pg from '../db/index.ts'
import { DBError } from '../error-handler/db.error.ts'

async function getPasswordReset(searchPasswordReset: PasswordReset): Promise<DBResponse<DBPasswordReset>> {
    let query = 'SELECT * FROM password_reset_tokens'
    const values: unknown[] = []
    let isFirstCondition = true

    if (searchPasswordReset.id) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}id = $${values.length + 1}`
        )
        values.push(searchPasswordReset.id)
        isFirstCondition = false
    }

    if (searchPasswordReset.userId) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}user_id = $${values.length + 1}`
        )
        values.push(searchPasswordReset.userId)
        isFirstCondition = false
    }

    if (searchPasswordReset.tokenHash) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}token_hash = $${values.length + 1}`
        )
        values.push(searchPasswordReset.tokenHash)
    }

    return pg
        .query(`${query} LIMIT 1`, values)
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function savePasswordReset(newPasswordReset: PasswordReset): Promise<DBResponse<DBPasswordReset>> {
    return pg
        .query(
            `
                INSERT INTO password_reset_tokens (
                    user_id,
                    token_hash,
                    expires_at
                )
                VALUES ($1, $2, $3)
                RETURNING *
            `,
            [
                newPasswordReset.userId,
                newPasswordReset.tokenHash,
                newPasswordReset.expiresAt
            ]
        )
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function updatePasswordReset(updatedPasswordReset: PasswordReset): Promise<DBResponse<DBPasswordReset>> {
    let query = 'UPDATE password_reset_tokens SET'
    const values: unknown[] = []
    let isFirstCondition = true

    if (updatedPasswordReset.userId) {
        query = query.concat(` user_id = $${values.length + 1}`)
        values.push(updatedPasswordReset.userId)
        isFirstCondition = false
    }

    if (updatedPasswordReset.tokenHash) {
        query = query.concat(`${isFirstCondition ? ' ' : ' , '}token_hash = $${values.length + 1}`)
        values.push(updatedPasswordReset.tokenHash)
        isFirstCondition = false
    }

    if (updatedPasswordReset.expiresAt) {
        query = query.concat(`${isFirstCondition ? ' ' : ' , '}expires_at = $${values.length + 1}`)
        values.push(updatedPasswordReset.expiresAt)
    }

    values.push(updatedPasswordReset.id)

    return pg
        .query(`${query} WHERE id = $${values.length} RETURNING *`, values)
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function deletePasswordReset(deletedPasswordReset: PasswordReset): Promise<DBResponse<DBPasswordReset>> {
    let query = 'DELETE FROM password_reset_tokens'
    const values: unknown[] = []
    let isFirstCondition = true

    if (deletedPasswordReset.id) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}id = $${values.length + 1}`
        )
        values.push(deletedPasswordReset.id)
        isFirstCondition = false
    }

    if (deletedPasswordReset.userId) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}user_id = $${values.length + 1}`
        )
        values.push(deletedPasswordReset.userId)
    }

    return pg
        .query(`${query} RETURNING *`, values)
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

export {
    getPasswordReset,
    savePasswordReset,
    updatePasswordReset,
    deletePasswordReset
}
