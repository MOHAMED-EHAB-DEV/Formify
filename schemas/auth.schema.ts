import * as v from 'valibot';

export const SignInSchema = v.object({
  email: v.pipe(
    v.string('Email must be a string'),
    v.trim(),
    v.nonEmpty('Please enter your email'),
    v.email('Please enter a valid email address')
  ),
  password: v.pipe(
    v.string('Password must be a string'),
    v.nonEmpty('Please enter your password')
  ),
});

export type SignInInput = v.InferInput<typeof SignInSchema>;

export const SignUpSchema = v.object({
  name: v.pipe(
    v.string('Name must be a string'),
    v.trim(),
    v.nonEmpty('Please enter your full name'),
    v.minLength(2, 'Name must be at least 2 characters')
  ),
  email: v.pipe(
    v.string('Email must be a string'),
    v.trim(),
    v.nonEmpty('Please enter your email'),
    v.email('Please enter a valid email address')
  ),
  password: v.pipe(
    v.string('Password must be a string'),
    v.nonEmpty('Please enter your password'),
    v.minLength(6, 'Password must be at least 6 characters')
  ),
});

export type SignUpInput = v.InferInput<typeof SignUpSchema>;

export const UpdateProfileSchema = v.object({
  name: v.pipe(
    v.string('Name must be a string'),
    v.trim(),
    v.nonEmpty('Please enter your name'),
    v.minLength(2, 'Name must be at least 2 characters')
  ),
  email: v.pipe(
    v.string('Email must be a string'),
    v.trim(),
    v.nonEmpty('Please enter your email'),
    v.email('Please enter a valid email address')
  ),
  image: v.optional(v.string()),
});

export type UpdateProfileInput = v.InferInput<typeof UpdateProfileSchema>;

export const UpdatePasswordSchema = v.pipe(
  v.object({
    currentPassword: v.pipe(
      v.string(),
      v.nonEmpty('Current password is required')
    ),
    newPassword: v.pipe(
      v.string(),
      v.nonEmpty('New password is required'),
      v.minLength(6, 'New password must be at least 6 characters')
    ),
    confirmPassword: v.pipe(
      v.string(),
      v.nonEmpty('Please confirm your new password')
    ),
  }),
  v.forward(
    v.partialCheck(
      [['newPassword'], ['confirmPassword']],
      (input) => input.newPassword === input.confirmPassword,
      'Passwords do not match'
    ),
    ['confirmPassword']
  )
);

export type UpdatePasswordInput = v.InferInput<typeof UpdatePasswordSchema>;
