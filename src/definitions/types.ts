import z from 'zod'
import { partialUserSchema, userSchema } from '../schemas/user.schema'
import { coreSchema, partialCoreSchema } from '../schemas/core.schema'
import { coreUserSchema, partialCoreUserSchema } from '../schemas/core-user.schema'
import { partialRoleSchema, roleSchema } from '../schemas/role.schema'
import { DBError } from '../error-handler/db.error'

export type DBResponse = {
    data: any | null
    error: DBError | null
}

export type User = z.infer<typeof userSchema>
export type PartialUser = z.infer<typeof partialUserSchema>

export type Core = z.infer<typeof coreSchema>
export type PartialCore = z.infer<typeof partialCoreSchema>

export type Role = z.infer<typeof roleSchema>
export type PartialRole = z.infer<typeof partialRoleSchema>

export type CoreUser = z.infer<typeof coreUserSchema>
export type PartialCoreUser = z.infer<typeof partialCoreUserSchema>
