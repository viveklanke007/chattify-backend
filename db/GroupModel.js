const mongoose = require("mongoose");

const GroupModel = new mongoose.Schema({
  groupname: {
    type: String,
    required: true,
    trim: true,
  },

  bio: {
    type: String,
    default: "",
  },

  avatar: {
    type: String, // URL or path
    default: "",
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  ],

  memberRequest: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  ],

  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
  },
});

module.exports = mongoose.model("Group", GroupModel);
