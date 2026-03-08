import z from 'zod'
import { partialUserSchema, userSchema } from '../schemas/user.schema'

export type User = z.infer<typeof userSchema>
export type PartialUser = z.infer<typeof partialUserSchema>

export type TestType = {
    test: string
}
