import { z } from 'zod';

const emailSchema = z.string().trim().max(254, 'Email address is too long.').pipe(
  z.email({ error: 'Enter a valid email address.' })
);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.').max(72, 'Password must be 72 characters or fewer.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80, 'Name must be 80 characters or fewer.'),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72, 'Password must be 72 characters or fewer.'),
  confirmPassword: z.string().min(1, 'Confirm your password.'),
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
});

export function errorsFromIssues(issues) {
  return issues.reduce((errors, issue) => {
    const field = issue.path[0] || 'form';
    if (!errors[field]) errors[field] = issue.message;
    return errors;
  }, {});
}
