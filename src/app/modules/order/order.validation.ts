import { z } from "zod";

/* ---------------------------- CREATE ORDER ---------------------------- */
const createOrderZodSchema = z.object({
  body: z.object({
    eventId: z.string({
      required_error: "Event ID is required",
    }),

    quantity: z
      .number({
        required_error: "Quantity is required",
      })
      .min(1, "Quantity must be at least 1"),

    ticketType: z.string({
      required_error: "Ticket type is required",
    }),

    contact: z.object({
      name: z.string({
        required_error: "Contact name is required",
      }),
      email: z
        .string({
          required_error: "Contact email is required",
        })
        .email("Invalid email address"),
      countryCode: z.string({
        required_error: "Country code is required",
      }),
      phone: z.string({
        required_error: "Phone number is required",
      }),
    }),

    address: z.object({
      line1: z.string({
        required_error: "Address line1 is required",
      }),
      line2: z.string().optional(),
      city: z.string({
        required_error: "City is required",
      }),
      zip: z.string({
        required_error: "ZIP code is required",
      }),
      country: z.string({
        required_error: "Country is required",
      }),
    }),
  }),
});

/* ---------------------------- UPDATE ORDER ---------------------------- */
const updateOrderZodSchema = z.object({
  body: z.object({
    quantity: z.number().min(1).optional(),
    ticketType: z.string().optional(),

    contact: z
      .object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        countryCode: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),

    address: z
      .object({
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
  }),
});

/* ---------------------------- EXPORT ---------------------------- */
export const OrderValidation = {
  createOrderZodSchema,
  updateOrderZodSchema,
};
