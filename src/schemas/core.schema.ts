import z from 'zod'

const coreSchema = z.object({
    id: z
        .uuid({ error: 'ID must be a valid UUID' })
        .optional(),
    name: z
        .string({ error: 'Name must be a string' })
        .trim(),
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
