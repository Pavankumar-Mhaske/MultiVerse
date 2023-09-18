import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { DB_NAME } from "./constants.js";
import { dbInstance } from "./db/index.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";

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
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// api routes
import { errorHandler } from "./middlewares/error.middlewares.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

// * Public apis
// TODO: More functionality specific to the type of api, can be added in the future
import randomuserRouter from "./routes/public/randomuser.routes.js";
import randomproductRouter from "./routes/public/randomproduct.routes.js";
import randomjokeRouter from "./routes/public/randomjoke.routes.js";
import bookRouter from "./routes/public/book.routes.js";
import quoteRouter from "./routes/public/quote.routes.js";
import mealRouter from "./routes/public/meal.routes.js";
import dogRouter from "./routes/public/dog.routes.js";
import catRouter from "./routes/public/cat.routes.js";

// * App routes
import userRouter from "./routes/apps/auth/user.routes.js";
import categoryRouter from "./routes/apps/ecommerce/category.routes.js";
import addressRouter from "./routes/apps/ecommerce/address.routes.js";
import profileRouter from "./routes/apps/ecommerce/profile.routes.js";
import productRouter from "./routes/apps/ecommerce/product.routes.js";
import cartRouter from "./routes/apps/ecommerce/cart.routes.js";
import orderRouter from "./routes/apps/ecommerce/order.routes.js";

// * Public apis
app.use("/api/v1/healthcheck", healthcheckRouter);

app.use("/api/v1/public/randomusers", randomuserRouter);

app.use("/api/v1/public/randomproducts", randomproductRouter);

app.use("/api/v1/public/randomjokes", randomjokeRouter);

app.use("/api/v1/public/books", bookRouter);

app.use("/api/v1/public/quotes", quoteRouter);

app.use("/api/v1/public/meals", mealRouter);

app.use("/api/v1/public/dogs", dogRouter);

app.use("/api/v1/public/cats", catRouter);

// * App apis
app.use("/api/v1/users", userRouter);
app.use("/api/v1/ecommerce/categories", categoryRouter);
app.use("/api/v1/ecommerce/addresses", addressRouter);
app.use("/api/v1/ecommerce/products", productRouter);
app.use("/api/v1/ecommerce/profile", profileRouter);
app.use("/api/v1/ecommerce/cart", cartRouter);
app.use("/api/v1/ecommerce/orders", orderRouter);

app.delete("/api/v1/reset-db", async (req, res) => {
  if (dbInstance) {
    dbInstance.connection.db.dropDatabase({
      dbName: DB_NAME,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Database dropped successfully"));
  }
  throw new ApiError(500, "Something went wrong while dropping the database");
});

// common error handling middleware
app.use(errorHandler);

export { app };
