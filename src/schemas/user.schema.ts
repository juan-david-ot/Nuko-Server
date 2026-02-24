import z from 'zod'
import { PartialUser, User } from '../definitions/types'

export const userSchema = z.object({
    id: z
        .uuid({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'ID is required' :
                'ID must be a valid UUID'
        }),
    name: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Name is required' :
                'Name must be a string'
        })
        .min(2, 'Name must be at least 2 characters long')
        .trim(),
    nickname: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Nickname is required' :
                'Nickname must be a string'
        })
        .trim(),
    description: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Description is required' :
                'Description must be a string'
        })
        .trim()
        .optional(),
    email: z
        .email({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Email is required' :
                'Email must be a valid email address'
        })
        .trim(),
    password: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Password is required' :
                'Password must be a string'
        })
        .min(6, 'Password must be at least 6 characters long')
})

export const partialUserSchema = userSchema.partial()

export function validateUser(input: object): Promise<z.ZodSafeParseResult<User>> {
    return userSchema.safeParseAsync(input)
}

export function validatePartialUser(input: object): Promise<z.ZodSafeParseResult<PartialUser>> {
    return partialUserSchema.safeParseAsync(input)
}
