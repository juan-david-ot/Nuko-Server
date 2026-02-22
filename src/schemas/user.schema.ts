import z from 'zod'

export const userSchema = z.object({
    id: z
        .uuid({
            error: (iss) => iss.input === undefined || iss.input === null ?
                'ID is required' :
                'ID must be a valid UUID'
        }),
    name: z
        .string({
            error: (iss) => iss.input === undefined || iss.input === null ?
                'Name is required' :
                'Name must be a string'
        })
        .min(2, 'Name must be at least 2 characters long')
        .trim(),
    nickname: z
        .string({
            error: (iss) => iss.input === undefined || iss.input === null ?
                'Nickname is required' :
                'Nickname must be a string'
        })
        .trim(),
    description: z
        .string({
            error: (iss) => iss.input === undefined || iss.input === null ?
                'Description is required' :
                'Description must be a string'
        })
        .trim()
        .optional(),
    email: z
        .email({
            error: (iss) => iss.input === undefined || iss.input === null ?
                'Email is required' :
                'Email must be a valid email address'
        })
        .trim(),
    password: z
        .string({
            error: (iss) => iss.input === undefined || iss.input === null ?
                'Password is required' :
                'Password must be a string'
        })
        .min(6, 'Password must be at least 6 characters long')
})

const partialUserSchema = userSchema.partial()

export type User = z.infer<typeof userSchema>
export type PartialUser = z.infer<typeof partialUserSchema>

export function validateUser(input: object): Promise<z.ZodSafeParseResult<User>> {
    return userSchema.safeParseAsync(input)
}

export function validatePartialUser(input: object): Promise<z.ZodSafeParseResult<PartialUser>> {
    return partialUserSchema.safeParseAsync(input)
}
