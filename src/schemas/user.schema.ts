import z from 'zod'
import { PartialUser, User } from '../definitions/types'

const userSchema = z.object({
    email: z
        .email({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Email is required' :
                'Email must be a valid email address'
        })
        .trim(),
    username: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Username is required' :
                'Username must be a string'
        })
        .trim(),
    password: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Password is required' :
                'Password must be a string'
        })
        .min(6, 'Password must be at least 6 characters long'),
    name: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Name is required' :
                'Name must be a string'
        })
        .min(2, 'Name must be at least 2 characters long')
        .trim()
        .optional(),
    surname: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Name is required' :
                'Name must be a string'
        })
        .min(2, 'Name must be at least 2 characters long')
        .trim()
        .optional()
})

const partialUserSchema = userSchema.partial()

async function validateUser(input: object): Promise<z.ZodSafeParseResult<User>> {
    return userSchema.safeParseAsync(input)
}

async function validatePartialUser(input: object): Promise<z.ZodSafeParseResult<PartialUser>> {
    return partialUserSchema.safeParseAsync(input)
}

export {
    userSchema,
    partialUserSchema,
    validateUser,
    validatePartialUser
}
