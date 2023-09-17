import dotenv from "dotenv";
import cors from "cors";
import express from "express";

dotenv.config({
  path: "./.env",
});

const app = express();

// global middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// api routes
import { errorHandler } from "./middlewares/error.middlewares.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import randomuserRouter from "./routes/public/randomuser.routes.js";
import randomproductRouter from "./routes/public/randomproduct.routes.js";
import randomjokeRouter from "./routes/public/randomjoke.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);

app.use("/api/v1/public/randomusers", randomuserRouter);

app.use("/api/v1/public/randomproducts", randomproductRouter);

app.use("/api/v1/public/randomjokes", randomjokeRouter);

// common error handling middleware
app.use(errorHandler);

export { app };