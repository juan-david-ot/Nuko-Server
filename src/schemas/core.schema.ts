import z from 'zod'

const coreSchema = z.object({
    id: z
        .uuid({ error: 'ID must be a valid UUID' })
        .optional(),
    name: z
        .string({ error: 'Name must be a string' })
        .trim()
        .min(3, 'Core name must be at least 3 characters long'),
    creatorId: z.uuid({ error: 'ID must be a valid UUID' }),
    createdAt: z
        .date()
        .optional()
})

const partialCoreSchema = coreSchema.partial()

export {
    coreSchema,
    partialCoreSchema
}
