
import { Router } from "express";

import {
    createEventController,
    getAllEventsController,
    getMyEventsController,
    getUpcomingEventsController,
    getRecentEventsController,
    getJoinedEventsController,
    getEventByIdController,
    updateEventController,
    deleteEventController,
    joinEventController,
} from "../controllers/event.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Public Routes
router.get("/recent", getRecentEventsController);
router.get("/upcoming", getUpcomingEventsController);
router.get("/", getAllEventsController);

// Protected Routes
router.get("/joined", authMiddleware, getJoinedEventsController);
router.get("/my-events", authMiddleware, getMyEventsController);

router.post("/", authMiddleware, createEventController);
router.patch("/:id", authMiddleware, updateEventController);
router.delete("/:id", authMiddleware, deleteEventController);
router.post("/:id/join", authMiddleware, joinEventController);

// Dynamic Route - Keep this LAST
router.get("/:id", getEventByIdController);

export default router;
