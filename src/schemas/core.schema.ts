import z from 'zod'

const coreSchema = z.object({
    id: z
        .uuid({ error: 'El ID debe ser un UUID valido' })
        .optional(),
    name: z
        .string({ error: 'El nombre no es valido' })
        .trim()
        .min(3, 'El nombre del nucleo debe tener al menos 3 caracteres'),
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
