import { z } from 'zod'

export const categorySchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Ingresá el nombre de la categoría.')
    .max(120, 'El nombre no puede superar los 120 caracteres.'),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres.'),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
