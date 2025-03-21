const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// Connection Schema
const connectionSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chatuser", // Reference to User schema
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  msg_name: {
    type: String,
    default: null,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists."],
      validate: [validator.isEmail, "Not a valid email."],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: [true, "Phone number already exists."],
      minLength: 10,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 8,
    },
    confirmPassword: {
      type: String,
      required: [true, "Confirm Password is required"],
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: "Passwords do not match.",
      },
    },
    friends: [{ type: mongoose.Schema.ObjectId, ref: "chatuser" }],
    socketId: String,
    active: Boolean,
    connections: [connectionSchema],
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
  }
  next();
});

userSchema.methods.checkPassword = async function (userPassword, password) {
  const value = await bcrypt.compare(password, userPassword);
  return value;
};
const User = mongoose.model("chatuser", userSchema);

module.exports = User;
