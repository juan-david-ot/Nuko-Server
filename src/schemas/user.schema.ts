import z from 'zod'

const userSchema = z.object({
    id: z
        .uuid({ error: 'El ID debe ser un UUID valido' })
        .optional(),
    email: z
        .email({
            error: (issue) => issue.input === undefined || issue.input === null
                ? 'El email es requerido'
                : 'El email no es valido'
        })
        .toLowerCase()
        .trim(),
    username: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null
                ? 'El nombre de usuario es requerido'
                : 'El nombre de usuario no es valido'
        })
        .trim()
        .toLowerCase()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .regex(/^[a-zA-Z0-9._-]+$/, 'El nombre de usuario solo debe contener letras, numeros y algunos caracteres especiales (. _ -)'),
    password: z
        .string({
            error: (issue) => issue.input === undefined || issue.input === null
                ? 'La contraseña es requerida'
                : 'La contraseña no es valida'
        })
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    name: z
        .string({ error: 'El nombre no es valido' })
        .trim()
        .optional(),
    surname: z
        .string({ error: 'El apellido no es valido' })
        .trim()
        .optional(),
    createdAt: z
        .date()
        .optional(),
    passwordChangedAt: z
        .date()
        .optional()
})

const partialUserSchema = userSchema.partial()

export {
    userSchema,
    partialUserSchema
}
