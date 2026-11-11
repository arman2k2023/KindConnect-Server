
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";

import type {
  CreateEventInput,
  EventDocument,
} from "../types/event.js";

const COLLECTION_NAME = "events";

// Create Event
export async function createEvent(
  eventData: CreateEventInput,
  organizerId: string
) {
  const db = await connectDB();

  const newEvent: EventDocument = {
    ...eventData,
    organizerId,
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db
    .collection<EventDocument>(COLLECTION_NAME)
    .insertOne(newEvent);

  return {
    ...newEvent,
    _id: result.insertedId,
  };
}

// Get All Events
export async function getAllEvents() {
  const db = await connectDB();

  return db
    .collection<EventDocument>(COLLECTION_NAME)
    .find()
    .sort({ date: 1 })
    .toArray();
}

// Get Events Created By Logged-in User
export async function getMyEvents(organizerId: string) {
  const db = await connectDB();

  return db
    .collection<EventDocument>(COLLECTION_NAME)
    .find({ organizerId })
    .sort({ date: 1 })
    .toArray();
}

// Get Recent Upcoming Events (Home Page - Maximum 6)
export async function getRecentEvents() {
  const db = await connectDB();

  return db
    .collection<EventDocument>(COLLECTION_NAME)
    .find({
      date: {
        $gt: new Date().toISOString(),
      },
    })
    .sort({ date: 1 })
    .limit(6)
    .toArray();
}

// Get All Upcoming Events (Upcoming Events Page - No Limit)
export async function getUpcomingEvents() {
  const db = await connectDB();

  return db
    .collection<EventDocument>(COLLECTION_NAME)
    .find({
      date: {
        $gt: new Date().toISOString(),
      },
    })
    .sort({ date: 1 })
    .toArray();
}

// Get Event By ID
export async function getEventById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = await connectDB();

  return db
    .collection<EventDocument>(COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(id),
    });
}

// Update Event
export async function updateEvent(
  id: string,
  organizerId: string,
  eventData: Partial<CreateEventInput>
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = await connectDB();

  const result = await db
    .collection<EventDocument>(COLLECTION_NAME)
    .findOneAndUpdate(
      {
        _id: new ObjectId(id),
        organizerId,
      },
      {
        $set: {
          ...eventData,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    );

  return result;
}

// Delete Event
export async function deleteEvent(
  id: string,
  organizerId: string
) {
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const db = await connectDB();

  const result = await db
    .collection<EventDocument>(COLLECTION_NAME)
    .deleteOne({
      _id: new ObjectId(id),
      organizerId,
    });

  return result.deletedCount > 0;
}

// Join Event
export async function joinEvent(
  id: string,
  userId: string
) {
  if (!ObjectId.isValid(id)) {
    return {
      status: "not_found",
      event: null,
    };
  }

  const db = await connectDB();

  const eventsCollection =
    db.collection<EventDocument>(COLLECTION_NAME);

  const eventId = new ObjectId(id);

  const result = await eventsCollection.findOneAndUpdate(
    {
      _id: eventId,
      participants: {
        $ne: userId,
      },
    },
    {
      $addToSet: {
        participants: userId,
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (result) {
    return {
      status: "joined",
      event: result,
    };
  }

  const existingEvent = await eventsCollection.findOne({
    _id: eventId,
  });

  if (!existingEvent) {
    return {
      status: "not_found",
      event: null,
    };
  }

  return {
    status: "already_joined",
    event: existingEvent,
  };
}

// Get Events Joined By User
export async function getJoinedEvents(userId: string) {
  const db = await connectDB();

  return db
    .collection<EventDocument>(COLLECTION_NAME)
    .find({
      participants: userId,
    })
    .sort({
      date: 1,
    })
    .toArray();
}
