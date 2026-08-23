import type { PasswordResetToken } from '../definitions/types.ts'
import pg from '../db/index.ts'
import { DBError } from '../error-handler/db.error.ts'

async function getPasswordReset(passwordReset: PasswordResetToken) {
    let query = 'SELECT * FROM password_reset_tokens'
    const values: unknown[] = []
    let isFirstCondition = true

    if (passwordReset.id) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}id = $${values.length + 1}`
        )
        values.push(passwordReset.id)
        isFirstCondition = false
    }

    if (passwordReset.userId) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}user_id = $${values.length + 1}`
        )
        values.push(passwordReset.userId)
        isFirstCondition = false
    }

    if (passwordReset.tokenHash) {
        query = query.concat(
            `${isFirstCondition ? ' WHERE ' : ' AND '}token_hash = $${values.length + 1}`
        )
        values.push(passwordReset.tokenHash)
    }

    return pg
        .query(`${query} LIMIT 1`, values)
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function savePasswordReset(passwordReset: PasswordResetToken) {
    const query = `
        INSERT INTO password_reset_tokens (
            user_id,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3)
        RETURNING *
    `
    return pg
        .query(
            query,
            [
                passwordReset.userId,
                passwordReset.tokenHash,
                passwordReset.expiresAt
            ]
        )
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

async function updatePasswordReset(passwordReset: PasswordResetToken) {
    let query = 'UPDATE password_reset_tokens SET'
    const values: unknown[] = []
    let isFirstCondition = true

    if (passwordReset.userId) {
        query = query.concat(` user_id = $${values.length + 1}`)
        values.push(passwordReset.userId)
        isFirstCondition = false
    }

    if (passwordReset.tokenHash) {
        query = query.concat(`${isFirstCondition ? ' ' : ' , '}token_hash = $${values.length + 1}`)
        values.push(passwordReset.tokenHash)
        isFirstCondition = false
    }

    if (passwordReset.expiresAt) {
        query = query.concat(`${isFirstCondition ? ' ' : ' , '}expires_at = $${values.length + 1}`)
        values.push(passwordReset.expiresAt)
    }

    values.push(passwordReset.id)

    return pg
        .query(`${query} WHERE id = $${values.length} RETURNING *`, values)
        .then((result) => ({ data: result.rows[0], error: null }))
        .catch((error) => ({ data: null, error: new DBError(error) }))
}

export {
    getPasswordReset,
    savePasswordReset,
    updatePasswordReset
}
