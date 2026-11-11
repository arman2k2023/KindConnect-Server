
import type { Request, Response } from "express";
import { createEventSchema } from "../utils/event.validation.js";

import {
  createEvent,
  getAllEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  getUpcomingEvents,
  getRecentEvents,
  getJoinedEvents,
} from "../services/event.service.js";

// Authenticated user information from JWT middleware
interface AuthenticatedLocals extends Record<string, any> {
  user: {
    id: string;
  };
}

// Create Event
export async function createEventController(
  req: Request,
  res: Response<unknown, AuthenticatedLocals>
) {
  try {
    const validation = createEventSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const organizerId = res.locals.user.id;
    const event = await createEvent(validation.data, organizerId);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
}

// Get All Events
export async function getAllEventsController(
  _req: Request,
  res: Response
) {
  try {
    const events = await getAllEvents();

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Get events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get events",
    });
  }
}

// Get Events Created By Logged-in User
export async function getMyEventsController(
  _req: Request,
  res: Response<unknown, AuthenticatedLocals>
) {
  try {
    const organizerId = res.locals.user.id;
    const events = await getMyEvents(organizerId);

    return res.status(200).json({
      success: true,
      message: "My events retrieved successfully",
      data: events,
    });
  } catch (error) {
    console.error("Get my events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get my events",
    });
  }
}

// Get Recent Upcoming Events (Home Page - Maximum 6)
export async function getRecentEventsController(
  _req: Request,
  res: Response
) {
  try {
    const events = await getRecentEvents();

    return res.status(200).json({
      success: true,
      message: "Recent events retrieved successfully",
      data: events,
    });
  } catch (error) {
    console.error("Get recent events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get recent events",
    });
  }
}

// Get All Upcoming Events (No Limit)
export async function getUpcomingEventsController(
  _req: Request,
  res: Response
) {
  try {
    const events = await getUpcomingEvents();

    return res.status(200).json({
      success: true,
      message: "Upcoming events retrieved successfully",
      data: events,
    });
  } catch (error) {
    console.error("Get upcoming events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get upcoming events",
    });
  }
}

// Get Event By ID
export async function getEventByIdController(
  req: Request,
  res: Response
) {
  try {
    const eventId = String(req.params.id);
    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get event",
    });
  }
}

// Update Event
export async function updateEventController(
  req: Request,
  res: Response<unknown, AuthenticatedLocals>
) {
  try {
    const validation = createEventSchema.partial().safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const organizerId = res.locals.user.id;
    const eventId = String(req.params.id);

    const event = await updateEvent(
      eventId,
      organizerId,
      validation.data
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Update event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
}

// Delete Event
export async function deleteEventController(
  req: Request,
  res: Response<unknown, AuthenticatedLocals>
) {
  try {
    const organizerId = res.locals.user.id;
    const eventId = String(req.params.id);

    const deleted = await deleteEvent(eventId, organizerId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Event not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
}

// Join Event
export async function joinEventController(
  req: Request,
  res: Response<unknown, AuthenticatedLocals>
) {
  try {
    const userId = res.locals.user.id;
    const eventId = String(req.params.id);

    const result = await joinEvent(eventId, userId);

    if (result.status === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (result.status === "already_joined") {
      return res.status(409).json({
        success: false,
        message: "You have already joined this event",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event joined successfully",
      data: result.event,
    });
  } catch (error) {
    console.error("Join event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to join event",
    });
  }
}

// Get Joined Events
export async function getJoinedEventsController(
  _req: Request,
  res: Response<unknown, AuthenticatedLocals>
) {
  try {
    const userId = res.locals.user.id;
    const events = await getJoinedEvents(userId);

    return res.status(200).json({
      success: true,
      message: "Joined events retrieved successfully",
      data: events,
    });
  } catch (error) {
    console.error("Get joined events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get joined events",
    });
  }
}
