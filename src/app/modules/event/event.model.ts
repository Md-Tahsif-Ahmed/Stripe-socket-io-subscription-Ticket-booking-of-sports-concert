import { Schema, model, Model } from 'mongoose';
import { IEvent, EventCategory, SectionColor, TicketCategory } from './event.interface';

const ticketCategorySchema = new Schema<TicketCategory>({
  ticketName: { type: String, required: true },
  sectionColor: { type: String, enum: Object.values(SectionColor), required: true },
  pricePerTicket: { type: Number, required: true, min: 0 },
  totalQuantity: { type: Number, required: true, min: 0 },
  notes: { type: String },
});

const eventSchema = new Schema<IEvent>(
  {
    thumbnail: { type: String },
    seatingChart: { type: String },
    title: { type: String, required: true },
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true, index: true },
    category: { type: String, enum: Object.values(EventCategory), required: true, index: true },
    eventDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    city: { type: String, required: true },
    venueName: { type: String, required: true },
    fullAddress: { type: String, required: true },
    description: { type: String },
        ticketSold: {
      type: Number,
      default: 0,
      index: true,
    },
    ticketCategories: [ticketCategorySchema], // Optional
  },
  { timestamps: true }
);

// Indexes for optimized queries
/* ---------------- INDEX STRATEGY ---------------- */

// Event details / artist page
eventSchema.index({ artistId: 1 });

// Homepage: Top Events
eventSchema.index({ ticketSold: -1, createdAt: -1 });

// Homepage: Featured by category
eventSchema.index({ category: 1, createdAt: -1 });

// View All / Filter
eventSchema.index({ category: 1, eventDate: 1 });

// City wise browsing
eventSchema.index({ city: 1, eventDate: 1 });


export const EventModel: Model<IEvent> = model<IEvent>('Event', eventSchema);