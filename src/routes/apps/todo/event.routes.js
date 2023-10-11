import { Router } from "express";

import {
  createEvent,
  getAllEvents,
  getUserEvents,
  getEventById,
  deleteEvent,
  updateIsVerified,
  getEventsOwner,
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
  .route("/:userId")
  .get(mongoIdPathVariableValidator("userId"), validate, getUserEvents)
  .patch(mongoIdPathVariableValidator("userId"), validate, updateIsVerified);

router
  .route("/:eventId/:userId")
  .get(mongoIdPathVariableValidator("eventId"), validate, getEventById)
  .delete(mongoIdPathVariableValidator("eventId"), validate, deleteEvent);

router
  .route("/getUser/:userId")
  .patch(
    mongoIdPathVariableValidator("eventId"),
    validate,
    updateEventValidator()
  )
  .get(mongoIdPathVariableValidator("userId"), validate, getEventsOwner);

export default router;
