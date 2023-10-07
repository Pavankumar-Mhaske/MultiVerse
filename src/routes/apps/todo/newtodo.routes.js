import { Router } from "express";

// import {
//   createTodo,
//   deleteTodo,
//   getAllTodos,
//   getTodoById,
//   toggleTodoDoneStatus,
//   updateTodo,
// } from "../../../controllers/apps/todo/todo.controllers.js";

import {
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  searchTodos,
} from "../../../controllers/apps/todo/newtodo.controllers.js";

// const {
//     createTodo,
//     getTodos,
//     getTodo,
//     editTodo,
//     deleteTodo,
//     searchTodos,
//   } = require("../controllers/TodoController");

import {
  createTodoValidator,
  getAllTodosQueryValidators,
  updateTodoValidator,
} from "../../../validators/apps/todo/todo.validators.js";

import { mongoIdPathVariableValidator } from "../../../validators/common/mongodb.validators.js";

import { validate } from "../../../validators/validate.js";

const router = Router();

router
  .route("/")
  .post(createTodoValidator(), validate, createTodo)
  .get(getAllTodosQueryValidators(), validate, getAllTodos);

router
  .route("/:todoId/:userId")
  .get(
    mongoIdPathVariableValidator("todoId"),
    mongoIdPathVariableValidator("userId"),
    validate,
    getTodoById
  )
  .patch(
    mongoIdPathVariableValidator("todoId"),
    mongoIdPathVariableValidator("userId"),
    updateTodoValidator(),
    validate,
    updateTodo
  )
  .delete(mongoIdPathVariableValidator("todoId"), validate, deleteTodo);

router
  .route("/search/:userId")
  .get(mongoIdPathVariableValidator("userId"), validate, searchTodos);

export default router;
