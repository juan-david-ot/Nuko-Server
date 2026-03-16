import z from 'zod'
import { partialUserSchema, userSchema } from '../schemas/user.schema'
import { coreSchema, partialCoreSchema } from '../schemas/core.schema'
import { coreUserSchema, partialCoreUserSchema } from '../schemas/core-user.schema'

export type User = z.infer<typeof userSchema>
export type PartialUser = z.infer<typeof partialUserSchema>

export type Core = z.infer<typeof coreSchema>
export type PartialCore = z.infer<typeof partialCoreSchema>

export type UserCore = z.infer<typeof coreUserSchema>
export type PartialUserCore = z.infer<typeof partialCoreUserSchema>
