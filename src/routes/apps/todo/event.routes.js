import { Router } from "express";

import {
  createEvent,
  getAllEvents,
  getEventById,
  deleteEvent,
} from "../../../controllers/apps/todo/event.controllers.js";

import {
  createEventValidator,
  updateEventValidator,
  getAllEventsQueryValidators,
} from "../../../validators/apps/todo/event.validators.js";

import { mongoIdPathVariableValidator } from "../../../validators/common/mongodb.validators.js";

import { validate } from "../../../validators/validate.js";

const router = Router();

router
  .route("/")
  .post(createEventValidator(), validate, createEvent)
  .get(getAllEventsQueryValidators(), validate, getAllEvents);

router
  .route("/:eventId/:userId")
  .get(
    mongoIdPathVariableValidator("eventId"),

    validate,
    getEventById
  )
  .delete(mongoIdPathVariableValidator("eventId"), validate, deleteEvent);

export default router;
