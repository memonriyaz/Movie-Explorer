/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  favorites: number[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: false,
      minlength: [6, "Password must be at least 6 characters long"],
      validate: {
        validator(this: any, password: string): boolean {
          return !!this.googleId || !!password;
        },
        message: "Password is required for non-OAuth users",
      },
    },
    googleId: {
      type: String,
      required: false,
      sparse: true,
    },
    favorites: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


// Use existing model if already compiled
const UserModel = models.User || model<IUser>("User", UserSchema);

export default UserModel;
