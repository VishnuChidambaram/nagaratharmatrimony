import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    forceLogin: z.boolean().optional(),
  })
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    gender: z.enum(['Male', 'Female']),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    mobileNumber: z.string().min(10).optional(),
    // Add other fields as needed based on the model
  })
});
