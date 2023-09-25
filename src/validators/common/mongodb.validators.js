import { body, param } from "express-validator";
/**
 * 'body' and 'param' are functions provided by the express-validator library for validating request data in an Express.js application.
 *
 * 1) body: The body function is used to validate data that is present in the 'request body'.
 *    For example, if you have a form with fields like "email," "username," and "password," you can use body to validate these fields to ensure they meet specific criteria, such as being non-empty or having a valid email format.
 *   body("email").isEmail().notEmpty();
 *   body("username").isAlphanumeric().notEmpty();
 *   body("password").isLength({ min: 6 }).notEmpty();
 *
 * 2) param: The param function is used to validate route parameters.
 *   For example, if you have a route like "/users/:userId," where ":userId" is a route parameter capturing a user's ID from the URL, you can use param to validate it.
 *   param("userId").isNumeric().toInt();
 *
 */

/**
 *
 * @param {string} idName
 * @description A common validator responsible to validate mongodb ids passed in the url's path variable
 */
export const mongoIdPathVariableValidator = (idName) => {
  return [
    param(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
  ];
};

/**
 *
 * @param {string} idName
 * @description A common validator responsible to validate mongodb ids passed in the request body
 */
export const mongoIdRequestBodyValidator = (idName) => {
  return [body(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`)];
};
