const mongoose = require("mongoose");

const MessageModel = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "recModel",
  },

  recModel: {
    type: String,
    required: true,
    enum: ["UserModel", "GroupModel"],
  },

  chatType: {
    type: String,
    enum: ["direct", "group"],
    default: "direct",
  },

  text: {
    type: String,
    default: "",
  },

  media: {
    type: String, // URL or file path
    default: "",
  },

  mediaType: {
    type: String,
    enum: [
      "image/jpeg",
      "image/png",
      "audio/mpeg",
      "audio/mp3",
      "video/mp4",
      "application/pdf",
      "text/plain",
      "null",
    ], // add all needed types
    default: "null",
  },

  isSeen: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageModel);
