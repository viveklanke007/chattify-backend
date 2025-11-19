const mongoose = require("mongoose");

const UserModel = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    select: false, // do not return password field by default
  },

  bio: {
    type: String,
    default: "",
  },

  avatar: {
    type: String, // URL or path
    default: "",
  },

  status: {
    type: String,
    enum: ["online", "offline", "busy", "away"],
    default: "offline",
  },

  // Follow System
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  friendRequest: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupModel",
    },
  ],
  groupRequest: [
    {
      from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      group: { type: mongoose.Schema.Types.ObjectId, ref: "GroupModel" },
    },
  ],

  socketId: {
    type: String,
    default: null,
  },

  isInCall: {
    type: Boolean,
    default: false,
  },

  callType: {
    type: String,
    enum: ["none", "voice", "video"],
    default: "none",
  },

  lastSeen: {
    type: Date,
    default: Date.now,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserModel);
