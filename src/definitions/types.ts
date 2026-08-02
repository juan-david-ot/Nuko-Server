import z from 'zod'
import { partialUserSchema, userSchema } from '../schemas/user.schema.ts'
import { coreSchema, partialCoreSchema } from '../schemas/core.schema.ts'
import { coreUserSchema, partialCoreUserSchema } from '../schemas/core-user.schema.ts'
import { partialRoleSchema, roleSchema } from '../schemas/role.schema.ts'
import { DBError } from '../error-handler/db.error.ts'

export type DBResponse<T> = {
    data: T | null
    error: DBError | null
}

type ToSnakeCase<S extends string, IsFirst extends boolean = true> =
    S extends `${infer Head}${infer Tail}`
    ? Head extends Lowercase<Head>
    ? `${Head}${ToSnakeCase<Tail, false>}`
    : IsFirst extends true
    ? `${Lowercase<Head>}${ToSnakeCase<Tail, false>}`
    : `_${Lowercase<Head>}${ToSnakeCase<Tail, false>}`
    : S

type DBType<T> = {
    [K in keyof T as K extends string ? ToSnakeCase<K> : K]: T[K]
}

export type User = z.infer<typeof userSchema>
export type PartialUser = z.infer<typeof partialUserSchema>
export type DBUser = DBType<User>
export type DBPartialUser = DBType<PartialUser>

export type Core = z.infer<typeof coreSchema>
export type PartialCore = z.infer<typeof partialCoreSchema>
export type DBCore = DBType<Core>
export type DBPartialCore = DBType<PartialCore>

export type Role = z.infer<typeof roleSchema>
export type PartialRole = z.infer<typeof partialRoleSchema>
export type DBRole = DBType<Role>
export type DBPartialRole = DBType<PartialRole>

export type CoreUser = z.infer<typeof coreUserSchema>
export type PartialCoreUser = z.infer<typeof partialCoreUserSchema>
export type DBCoreUser = DBType<CoreUser>
export type DBPartialCoreUser = DBType<PartialCoreUser>
