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
  const baseQuery = EventModel.find().populate("artistId");

  const queryBuilder = new QueryBuilder<IEvent>(baseQuery, query)
    .search(["title", "city", "venueName"])
    .filter()
    .sort()
    .fields()
    .paginate();

  const events = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  if (!events) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No events found");
  }

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

//

// const getHomePageData = async () => {
//   const topEvents = await EventModel.find({})
//     .sort({ ticketSold: -1 })
//     .limit(6);

//   const featuredConcerts = await EventModel.find({
//     category: "concert",
//   })
//     .sort({ createdAt: -1 })
//     .limit(6);

//   const featuredSports = await EventModel.find({
//     category: "sports",
//   })
//     .sort({ createdAt: -1 })
//     .limit(6);

//   return {
//     topEvents,
//     featuredConcerts,
//     featuredSports,
//   };
// };
const getHomePageData = async () => {
  const [topEvents, featuredConcerts, featuredSports] = await Promise.all([
    EventModel.find({ })
      .sort({ ticketSold: -1 })
      .limit(6)
      .populate("artistId", "name genre "),

    EventModel.find({
      category: "concert",
      
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("artistId", "name image"),

    EventModel.find({
      category: "sports",
  
    })
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  return {
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
