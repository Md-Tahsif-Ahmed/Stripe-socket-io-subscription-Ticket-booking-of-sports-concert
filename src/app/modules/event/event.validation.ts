import { z } from 'zod';
import { EventCategory, SectionColor } from './event.interface';

const ticketCategorySchema = z.object({
  ticketName: z.string().min(1, 'Ticket name is required'),
  sectionColor: z.enum(Object.values(SectionColor) as [string, ...string[]]),
  pricePerTicket: z.number().min(0, 'Price must be non-negative'),
  totalQuantity: z.number().min(0, 'Quantity must be non-negative'),
  notes: z.string().optional(),
});

const createEventZodSchema = z.object({
  body: z.object({
    thumbnail: z.string().optional(),
    seatingChart: z.string().optional(),
    title: z.string({ required_error: 'Title is required' }),
    artistId: z.string({ required_error: 'Artist ID is required' }),
    category: z.enum(Object.values(EventCategory) as [string, ...string[]]),
    eventDate: z.coerce.date({ required_error: 'Event date is required' }),
    // startTime: z.string({ required_error: 'Start time is required' }),
    city: z.string({ required_error: 'City is required' }),
    venueName: z.string({ required_error: 'Venue name is required' }),
    fullAddress: z.string({ required_error: 'Full address is required' }),
    description: z.string().optional(),
    ticketCategories: z.array(ticketCategorySchema).optional(),
  }),
});

const updateEventZodSchema = z.object({
  body: z.object({
    thumbnail: z.string().optional(),
    seatingChart: z.string().optional(),
    title: z.string().min(1).optional(),
    artistId: z.string().min(1).optional(),
    category: z.enum(Object.values(EventCategory) as [string, ...string[]]).optional(),
    eventDate: z.coerce.date().optional(),

    // startTime: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    venueName: z.string().min(1).optional(),
    fullAddress: z.string().min(1).optional(),
    description: z.string().optional(),
    ticketCategories: z.array(ticketCategorySchema).optional(),
  }),
});

export const EventValidation = { createEventZodSchema, updateEventZodSchema };