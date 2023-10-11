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

/**
 * - router.route("/:eventId/:userId").get(getEventById)
 * - router.route("/getUser/:userId").get(getEventsOwner);
 *
 * Bug: as this two routes are similar in pattern, they are creating conflict
 *        /:eventId/:userId  ~  /getUser/:userId
 *  due to this similarity in pattern, getUser will be treated as eventId and hence 'invalied eventId' error is thrown
 * thus to avoid that we need to change the pattern of routes
 */

router
  .route("/event/getUser/:userId")
  .get(mongoIdPathVariableValidator("userId"), validate, getEventsOwner);

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
