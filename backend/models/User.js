const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
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
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["store_manager", "training_manager", "crew"],
      default: "crew",
    },
    level: {
      type: String,
      enum: ["Level 1", "Level 2", "N/A"],
      default: "Level 1",
    },
    position: { type: String, default: "" },
    phone: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    leaveBalance: { type: Number, default: 20 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);