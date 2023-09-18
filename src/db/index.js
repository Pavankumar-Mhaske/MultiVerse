import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/** @type {typeof mongoose | undefined} */
export let dbInstance = undefined;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    // NOTE: command to drop mongo database
    // console.log(connectionInstance.connection.db.dropDatabase({
    //   dbName:"apihub"
    // }));
    console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(`MongoDB connection error : ${error}`);
    process.exit(1);
  }
};

export default connectDB;
