import z from 'zod'

const coreSchema = z.object({
    id: z
        .uuid({ error: 'El ID debe ser un UUID valido' })
        .optional(),
    name: z
        .string({ error: 'Name must be a string' })
        .trim()
        .min(3, 'Core name must be at least 3 characters long'),
    creatorId: z.uuid({ error: 'El creator ID debe ser un UUID valido' }),
    createdAt: z
        .date()
        .optional()
})

const partialCoreSchema = coreSchema.partial()

export {
    coreSchema,
    partialCoreSchema
}
