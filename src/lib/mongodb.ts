import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables.");
}

// ✅ Initialize the cache only once
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose;

export default async function connectMongoDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected");
        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
