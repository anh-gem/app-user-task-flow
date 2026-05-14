import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    city: String,
    qualification: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    tasks: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Done", "Paused"],
          default: "Pending",
        },
        subtasks: [
          {
            _id: mongoose.Schema.Types.ObjectId,
            subtask: String,
            status: {
              type: String,
              enum: ["Pending", "In Progress", "Done"],
              default: "Pending",
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notifications: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);