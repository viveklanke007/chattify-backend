const message = require("../db/MessageModel");
const UserModel = require("../db/UserModel.js");
const GroupModel = require("../db/GroupModel.js");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
  cloud_name: "dfdyvc43n",
  api_key: "114218146214427",
  api_secret: "TXUUrd8l7m6wT0_pagW1U4LZZbk",
});

const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text, recModel } = req.body;

    let media = null;
    let mediaType = null;

    // Upload media to Cloudinary
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "chatapp/media",
        resource_type: "auto",
      });

      media = uploaded.secure_url;
      mediaType = req.file.mimetype;
    }

    const newMsg = new message({
      senderId,
      receiverId,
      text,
      recModel,
      media,
      mediaType,
    });

    const savedMsg = await newMsg.save();
    console.log("sav", savedMsg);

    const io = req.app.get("io");

    if (recModel === "user") {
      io.to(receiverId).emit("newMessage", savedMsg);
      io.to(senderId).emit("newMessage", savedMsg);
    } else {
      io.to(receiverId).emit("newGroupMessage", savedMsg);
      io.to(senderId).emit("newGroupMessage", savedMsg);
    }

    res.status(200).json({
      message: "Message sent successfully",
      msg: savedMsg,
    });
  } catch (err) {
    console.error("UPLOAD ERROR", err);
    return res
      .status(500)
      .json({ message: "Upload failed", error: err.message });
  }
};

module.exports = { sendMessage };
