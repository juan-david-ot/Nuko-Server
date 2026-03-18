import z from 'zod'

const coreUserSchema = z.object({
    coreId: z.uuid({ error: 'ID must be a valid UUID' }),
    userId: z.uuid({ error: 'ID must be a valid UUID' }),
    role: z.uuid({ error: 'ID must be a valid UUID' }),
    joinedAt: z
        .date()
        .optional()
})

const partialCoreUserSchema = coreUserSchema.partial()

export {
    coreUserSchema,
    partialCoreUserSchema
}
