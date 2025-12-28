import { z } from "zod";

const createAdminZodSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: "Full Name is required" }),
    email: z.string({ required_error: "Email is required" }),
    password: z.string({ required_error: "Password is required" }),
    role: z.string({ required_error: "Role is required" }),
  }),
});

const createUserZodSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: "Full Name is required" }),
    email: z.string({ required_error: "Email is required" }),
    password: z.string({ required_error: "Password is required" }),
    role: z.string({ required_error: "Role is required" }),
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    profileImage: z.string().optional(),
  }),
});

export const UserValidation = { createAdminZodSchema, createUserZodSchema, updateUserZodSchema };