import z from 'zod'

const taskListSchema = z.object({
    id: z
        .uuid({ error: 'El ID debe ser un UUID valido' })
        .optional(),
    coreId: z.uuid({ error: 'El core ID debe ser un UUID valido' }),
    name: z
        .string({ error: 'El nombre no es valido' })
        .trim()
        .min(3, 'El nombre del nucleo debe tener al menos 3 caracteres'),
    icon: z
        .string({ error: 'El nombre no es valido' })
        .trim()
        .optional(),
    color: z
        .string({ error: 'El nombre no es valido' })
        .trim()
        .optional(),
    position: z
        .number()
        .optional(),
    creatorId: z.uuid({ error: 'El creator ID debe ser un UUID valido' }),
    archivedAt: z
        .date()
        .optional(),
    isArchived: z
        .boolean()
        .optional(),
    createdAt: z
        .date()
        .optional()
})

const partialTaskListSchema = taskListSchema.partial()

export {
    taskListSchema,
    partialTaskListSchema
}
