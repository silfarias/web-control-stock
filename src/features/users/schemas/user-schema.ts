import { z } from 'zod'
import type {
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  Usuario,
  UsuarioRole,
} from '@/features/users/types'

/** Misma regla que el backend (`pass_regex`). */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/

export const PASSWORD_HINT =
  '8 a 15 caracteres, con mayúscula, minúscula, número y un especial ($ @ ! % * ? &).'

const roleSchema = z.enum(['ADMIN', 'EMPLEADO'], {
  message: 'Seleccioná un rol.',
})

const passwordRequiredSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(15, 'La contraseña no puede superar los 15 caracteres.')
  .regex(PASSWORD_REGEX, PASSWORD_HINT)

export const createUserFormSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, 'Ingresá el nombre.')
      .max(120, 'El nombre no puede superar los 120 caracteres.'),
    email: z
      .string()
      .trim()
      .min(1, 'Ingresá el email.')
      .max(180, 'El email no puede superar los 180 caracteres.')
      .refine((value) => z.email().safeParse(value).success, 'Ingresá un email válido.'),
    password: passwordRequiredSchema,
    confirmPassword: z.string().min(1, 'Confirmá la contraseña.'),
    role: roleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>

export const editUserFormSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, 'Ingresá el nombre.')
      .max(120, 'El nombre no puede superar los 120 caracteres.'),
    email: z
      .string()
      .trim()
      .min(1, 'Ingresá el email.')
      .max(180, 'El email no puede superar los 180 caracteres.')
      .refine((value) => z.email().safeParse(value).success, 'Ingresá un email válido.'),
    password: z.string().max(15, 'La contraseña no puede superar los 15 caracteres.'),
    confirmPassword: z.string(),
    role: roleSchema,
  })
  .superRefine((data, ctx) => {
    const password = data.password.trim()
    if (!password) return

    if (password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'La contraseña debe tener al menos 8 caracteres.',
      })
      return
    }

    if (!PASSWORD_REGEX.test(password)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: PASSWORD_HINT,
      })
    }

    if (password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden.',
      })
    }
  })

export type EditUserFormValues = z.infer<typeof editUserFormSchema>

export const emptyCreateUserFormValues: CreateUserFormValues = {
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'EMPLEADO',
}

export function userToEditFormValues(user: Usuario): EditUserFormValues {
  return {
    nombre: user.nombre,
    email: user.email,
    password: '',
    confirmPassword: '',
    role: user.role,
  }
}

export function toCreateUsuarioRequest(values: CreateUserFormValues): CreateUsuarioRequest {
  return {
    nombre: values.nombre.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
    role: values.role as UsuarioRole,
  }
}

export function toUpdateUsuarioRequest(values: EditUserFormValues): UpdateUsuarioRequest {
  const payload: UpdateUsuarioRequest = {
    nombre: values.nombre.trim(),
    email: values.email.trim().toLowerCase(),
    role: values.role as UsuarioRole,
  }

  const password = values.password.trim()
  if (password) {
    payload.password = password
  }

  return payload
}

/** Perfil propio: nombre, email y password opcional. Nunca incluye role. */
export const profileFormSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, 'Ingresá el nombre.')
      .max(120, 'El nombre no puede superar los 120 caracteres.'),
    email: z
      .string()
      .trim()
      .min(1, 'Ingresá el email.')
      .max(180, 'El email no puede superar los 180 caracteres.')
      .refine((value) => z.email().safeParse(value).success, 'Ingresá un email válido.'),
    password: z.string().max(15, 'La contraseña no puede superar los 15 caracteres.'),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    const password = data.password.trim()
    if (!password) return

    if (password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'La contraseña debe tener al menos 8 caracteres.',
      })
      return
    }

    if (!PASSWORD_REGEX.test(password)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: PASSWORD_HINT,
      })
    }

    if (password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden.',
      })
    }
  })

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export function userToProfileFormValues(user: {
  nombre: string
  email: string
}): ProfileFormValues {
  return {
    nombre: user.nombre,
    email: user.email,
    password: '',
    confirmPassword: '',
  }
}

export function toUpdateProfileRequest(values: ProfileFormValues): UpdateUsuarioRequest {
  const payload: UpdateUsuarioRequest = {
    nombre: values.nombre.trim(),
    email: values.email.trim().toLowerCase(),
  }

  const password = values.password.trim()
  if (password) {
    payload.password = password
  }

  return payload
}
