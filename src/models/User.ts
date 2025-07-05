import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Optional for Google OAuth users
  googleId?: string;
  favorites: number[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
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
      required: false, // Not required for Google OAuth users
      minlength: [6, "Password must be at least 6 characters long"],
      validate: {
        validator: function (this: any, password: string) {
          // Only require password if googleId is not present
          return this.googleId || password;
        },
        message: "Password is required for non-OAuth users",
      },
    },
    googleId: {
      type: String,
      required: false,
      sparse: true, // Allows multiple nulls, but unique for non-null
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

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 }, { sparse: true });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
