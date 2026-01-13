import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import QueryBuilder from "../../builder/queryBuilder";
import { CreateEventInput, IEvent } from "./event.interface";
import { EventModel } from "./event.model";
import { ArtistModel } from "../artist/artist.model";

const createEventToDB = async (payload: CreateEventInput): Promise<IEvent> => {
  const artist = await ArtistModel.findById(payload.artistId);
  if (!artist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Artist not found");
  }

  const eventData: Partial<IEvent> = {
    ...payload,
    artistId: new Types.ObjectId(payload.artistId),
  };

  const event = await EventModel.create(eventData);

  if (!event) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create event");
  }

  return event;
};

const updateEventToDB = async (
  eventId: string,
  payload: Partial<IEvent>
): Promise<Partial<IEvent> | null> => {
  const isExistEvent = await EventModel.findById(eventId);
  if (!isExistEvent) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }

  const updateData: Partial<IEvent> = { ...payload };

  if (payload.artistId) {
    const artist = await ArtistModel.findById(payload.artistId);
    if (!artist) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Artist not found");
    }

    updateData.artistId = new Types.ObjectId(payload.artistId);
  }

  const updatedEvent = await EventModel.findByIdAndUpdate(eventId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedEvent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update event");
  }

  return updatedEvent;
};

const getEventByIdFromDB = async (id: string): Promise<IEvent> => {
  const event = await EventModel.findById(id).populate("artistId");

  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }

  return event;
};

const getAllEventsFromDB = async (query: any) => {
  const now = new Date();

  const baseQuery = EventModel.find().populate("artistId");

  // status filter
  if (query.type === "upcoming") {
    query.eventDate = { $gt: now };
  }

  if (query.type === "completed") {
    query.eventDate = { $lt: now };
  }

  if (query.type === "cancelled") {
    query.status = "CANCELLED";
  }

  const queryBuilder = new QueryBuilder<IEvent>(baseQuery, query)
    .searchByTitle()
    .filter()
    .sort()
    .paginate()
    .fields();

  const events = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  return {
    data: events,
    meta,
  };
};


const deleteEventFromDB = async (id: string): Promise<IEvent> => {
  const event = await EventModel.findById(id);

  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }

  const result = await EventModel.findByIdAndDelete(id);

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete event");
  }

  return result;
};

 

 
// const getHomePageData = async () => {
//   const [topEvents, featuredConcerts, featuredSports] = await Promise.all([
//     EventModel.find({ })
//       .sort({ ticketSold: -1 })
//       .limit(6)
//       .populate("artistId", "name genre "),

//     EventModel.find({
//       category: "Concert",
      
//     })
//       .sort({ createdAt: -1 })
//       .limit(6)
//       .populate("artistId", "name image"),

//     EventModel.find({
//       category: "Sports",
  
//     })
//       .sort({ createdAt: -1 })
//       .limit(6),
//   ]);

//   return {
//     topEvents,
//     featuredConcerts,
//     featuredSports,
//   };
// };

const getHomePageData = async (query: Record<string, any>) => {
  const baseQuery = EventModel.find();

  const qb = new QueryBuilder(baseQuery, query).searchByTitle();

  const filter = qb.modelQuery.getFilter();

  const [
    topEvents,
    featuredConcerts,
    featuredSports,
    totalEvents,
    ticketAgg,
  ] = await Promise.all([
    EventModel.find(filter)
      .sort({ ticketSold: -1 })
      .limit(6)
      .populate("artistId", "name genre image")
      .select("title thumbnail ticketSold eventDate city venueName"),

    EventModel.find({
      ...filter,
      category: "Concert",
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("artistId", "name image")
      .select("title thumbnail ticketSold eventDate city venueName"),

    EventModel.find({
      ...filter,
      category: "Sports",
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("title thumbnail ticketSold eventDate city venueName"),

    EventModel.countDocuments(),

    EventModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$ticketSold" },
        },
      },
    ]),
  ]);

  return {
    stats: {
      totalEvents,
      totalTicketsSold: ticketAgg[0]?.total || 0,
    },
    topEvents,
    featuredConcerts,
    featuredSports,
  };
};

 

export const EventService = {
  createEventToDB,
  updateEventToDB,
  getEventByIdFromDB,
  getAllEventsFromDB,
  deleteEventFromDB,
  getHomePageData,
};
