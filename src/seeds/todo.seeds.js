import { faker } from "@faker-js/faker";
import { Todo } from "../models/apps/todo/todo.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { TODOS_COUNT } from "./_constants.js";

// Generate random todos
const todos = new Array(TODOS_COUNT).fill("_").map(() => ({
  /* generates a random sentence using the faker library's lorem module.
   * faker - is a JavaScript library
   * lorem - is a module of the faker library
   * sentence - is a function of the lorem module
   * min and max - are options
   */
  title: faker.lorem.sentence({ min: 3, max: 5 }),
  description: faker.lorem.paragraph({
    min: 10,
    max: 15,
  }),
  isComplete: faker.datatype.boolean({}),
}));

const seedTodos = asyncHandler(async (req, res) => {
  await Todo.deleteMany({}); // delete existing todos

  await Todo.insertMany(todos); // insert new todos

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Todos inserted successfully"));
});

export { seedTodos };
