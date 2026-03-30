import z from 'zod'

const coreUserSchema = z.object({
    coreId: z.uuid({ error: 'El core ID debe ser un UUID valido' }),
    userId: z.uuid({ error: 'El user ID debe ser un UUID valido' }),
    role: z.uuid({ error: 'El role ID debe ser un UUID valido' }),
    joinedAt: z
        .date()
        .optional()
})

const partialCoreUserSchema = coreUserSchema.partial()

export {
    coreUserSchema,
    partialCoreUserSchema
}
