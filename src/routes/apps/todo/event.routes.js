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
// import { get } from "mongoose";

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
  .get(
    mongoIdPathVariableValidator("eventId"),
    mongoIdPathVariableValidator("userId"),
    validate,
    getEventById
  )
  .delete(
    mongoIdPathVariableValidator("eventId"),
    mongoIdPathVariableValidator("userId"),
    validate,
    deleteEvent
  );

router.route("/event/getUser/:userId").get(getEventsOwner);

// router.route("/getUser/:userId").get(
// mongoIdPathVariableValidator("userId"), validate,
// getEventsOwner
// );
// .patch(
//   mongoIdPathVariableValidator("userId"),
//   validate,
//   updateEventValidator()
// );

export default router;
