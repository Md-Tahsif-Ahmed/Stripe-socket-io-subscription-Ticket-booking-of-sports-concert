import { Types } from 'mongoose';

export enum EventCategory {
  CONCERT = 'Concert',
  SPORTS = 'Sports',
  THEATER = 'Theater',
 
}

export enum SectionColor {
  GOLD = 'Gold',
  PURPLE = 'Purple',
  INDIGO = 'Indigo',
  BLUE = 'Blue',
  GREEN = 'Green',
  AMBER = 'Amber',
  RED = 'Red',
  PINK = 'Pink',
  VIOLET = 'Violet',
  TEAL = 'Teal',
 
}

export interface TicketCategory {
  ticketName: string;
  sectionColor: SectionColor;
  pricePerTicket: number;
  totalQuantity: number;
  notes?: string; // Optional
}

export interface IEvent {
  thumbnail?: string; // URL
  seatingView?: string; // URL
  title: string;
  artistId: Types.ObjectId; // Ref to Artist model
  category: EventCategory;
  eventDate: Date;
  startTime: string; // e.g., '08:00 PM'
  city: string;
  venueName: string;
  fullAddress: string;
  description?: string;
  ticketSold: number;
  ticketCategories?: TicketCategory[]; // Optional array
}

export interface CreateEventInput extends Omit<IEvent, 'artistId'> {
  artistId: string; // Input as string, convert to ObjectId
}
 