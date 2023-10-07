import { body, query } from "express-validator";

const getAllEventsQueryValidators = () => {
  return [
    query("query").optional(),
    query("complete")
      .optional()
      .isBoolean({
        loose: true,
      })
      .withMessage("complete flag must be a boolean."),
  ];
};

const createEventValidator = () => {
  return [
    body("reminderMsg").trim().notEmpty().withMessage("Todo title is required"),
    body("remindAt").trim().notEmpty().withMessage("Todo title is required"),
    body("isReminded")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Activity status is required")
      .isBoolean({
        strict: true,
      })
      .withMessage("isReminded must be a boolean. Either true or false"),
  ];
};

const updateEventValidator = () => {
  return [
    body("reminderMsg")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Todo title is required"),
    body("remindAt")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Todo title is required"),
    body("isReminded")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Activity status is required")
      .isBoolean({
        strict: true,
      })
      .withMessage("isReminded must be a boolean. Either true or false"),
  ];
};

export {
  createEventValidator,
  updateEventValidator,
  getAllEventsQueryValidators,
};
