/* eslint-disable no-var */
import mongoose from "mongoose";

export type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache;
}
/* eslint-enable no-var */
