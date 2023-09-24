import { Router } from "express";
import {
  getRandomJokes,
  getARandomJoke,
  getJokeById,
} from "../../controllers/public/randomjoke.controllers";

const router = Router();

router.route("/").get(getRandomJokes);
router.route("/:jokeId").get(getJokeById);
router.route("/joke/random").get(getARandomJoke);

export default router;
