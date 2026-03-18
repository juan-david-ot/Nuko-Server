import z from 'zod'

const roleSchema = z.object({
    id: z
        .uuid({ error: 'ID must be a valid UUID' })
        .optional(),
    name: z
        .string({ error: 'Name must be a string' })
        .trim(),
    description: z
        .string()
        .trim()
        .optional(),
    createdAt: z
        .date()
        .optional()
})

const partialRoleSchema = roleSchema.partial()

export {
    roleSchema,
    partialRoleSchema
}
