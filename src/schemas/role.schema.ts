import z from 'zod'

const roleSchema = z.object({
    id: z
        .uuid({ error: 'El ID debe ser un UUID valido' })
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
