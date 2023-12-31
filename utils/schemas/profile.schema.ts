import { Schema } from "mongoose";

export const userSchema: Schema = new Schema(
  {
    address: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },
    username: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },
    slug: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },
    team: {
      type: String,
      required: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "users",
  }
);
