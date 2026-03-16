import z from 'zod'

const coreUserSchema = z.object({
    coreId: z.uuid({ error: 'ID must be a valid UUID' }),
    userId: z.uuid({ error: 'ID must be a valid UUID' }),
    role: z
        .string({ error: 'Surname must be a string' })
        .trim()
        .toLowerCase()
        .default('member')
})

const partialCoreUserSchema = coreUserSchema.partial()

export {
    coreUserSchema,
    partialCoreUserSchema
}
