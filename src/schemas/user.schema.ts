import z from 'zod'

const userSchema = z.object({
    id: z
        .uuid({ error: 'ID must be a valid UUID' })
        .optional(),
    email: z
        .email({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Email is required' :
                'Email must be a valid email address'
        })
        .toLowerCase()
        .trim(),
    username: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Username is required' :
                'Username must be a string'
        })
        .trim()
        .toLowerCase()
        .min(3, 'Username must be at least 3 characters long')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    password: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null ?
                'Password is required' :
                'Password must be a string'
        })
        .min(8, 'Password must be at least 8 characters long'),
    name: z
        .string({ error: 'Name must be a string' })
        .trim()
        .optional(),
    surname: z
        .string({ error: 'Surname must be a string' })
        .trim()
        .optional()
})

const partialUserSchema = userSchema.partial()

export {
    userSchema,
    partialUserSchema
}
