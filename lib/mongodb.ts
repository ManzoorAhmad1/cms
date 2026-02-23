// @ts-nocheck
import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Amazon DocumentDB requires retryWrites=false and specific TLS settings
    // For MongoDB Atlas, these options are ignored safely
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      retryWrites: false,          // Required for DocumentDB
      serverSelectionTimeoutMS: 5000,
      ...(process.env.DOCDB_TLS === 'true' && {
        tls: true,
        tlsAllowInvalidCertificates: false, // set true only for testing
      }),
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
