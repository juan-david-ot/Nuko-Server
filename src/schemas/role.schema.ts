import z from 'zod'

const roleSchema = z.object({
    id: z
        .uuid({ error: 'El ID debe ser un UUID valido' })
        .optional(),
    name: z
        .string({ error: 'El nombre no es valido' })
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
