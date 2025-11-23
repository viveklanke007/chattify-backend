// const message = require("../db/MessageModel");
// const UserModel = require("../db/UserModel.js");
// const GroupModel = require("../db/GroupModel.js");

// const sendMessage = async (req, res) => {
//   try {
//     const { senderId, receiverId, text, recModel } = req.body;
//     let media = null;
//     let mediaType = null;

//     if (req.file) {
//       media = `/uploads/images/${req.file.filename}`;
//       mediaType = req.file.mimetype;
//     }

//     const newMsg = new message({
//       senderId,
//       receiverId,
//       text,
//       recModel,
//       media,
//       mediaType,
//     });
//     const savedMsg = await newMsg.save();

//     // Emit message via socket.io
//     const io = req.app.get("io");
//     (io.to(receiverId).emit("newMessage", savedMsg) &&
//       io.to(senderId).emit("newMessage", savedMsg)) ||
//       (io.to(receiverId).emit("newGroupMessage", savedMsg) &&
//         io.to(senderId).emit("newGroupMessage", savedMsg));

//     const lastSeenTime = savedMsg.createdAt;
//     const sen = await UserModel.findById(senderId);
//     const rec = await UserModel.findById(receiverId);

//     const gp = await GroupModel.findById(receiverId);

//     if (sen) {
//       sen.lastSeen = lastSeenTime;
//       await sen.save();
//     }
//     if (rec) {
//       rec.lastSeen = lastSeenTime;
//       await rec.save();
//     }
//     if (gp) {
//       gp.lastSeen = lastSeenTime;
//       await gp.save();
//     }
//     console.log(rec, sen);
//     res.status(200).json({ message: "message sent successfully", savedMsg });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "some error occurred" });
//   }
// };

// module.exports = { sendMessage };

const message = require("../db/MessageModel");
const UserModel = require("../db/UserModel.js");
const GroupModel = require("../db/GroupModel.js");
const cloudinary = require("cloudinary").v2;

// Cloudinary config (use env variables)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// const sendMessage = async (req, res) => {
//   try {
//     const { senderId, receiverId, text, recModel } = req.body;

//     let media = null;
//     let mediaType = null;

//     // Upload media (image/video/docs) to Cloudinary
//     if (req.file) {
//       const upload = await cloudinary.uploader.upload(req.file.path, {
//         resource_type: "auto",
//         folder: "chatapp/media",
//       });

//       media = upload.secure_url;
//       mediaType = req.file.mimetype;
//     }

//     // Create new message
//     const newMsg = new message({
//       senderId,
//       receiverId,
//       text,
//       recModel,
//       media,
//       mediaType,
//     });

//     const savedMsg = await newMsg.save();

//     // Emit socket.io events
//     const io = req.app.get("io");

//     if (recModel === "user") {
//       io.to(receiverId).emit("newMessage", savedMsg);
//       io.to(senderId).emit("newMessage", savedMsg);
//     } else {
//       // Group message
//       io.to(receiverId).emit("newGroupMessage", savedMsg);
//       io.to(senderId).emit("newGroupMessage", savedMsg);
//     }

//     // Update lastSeen
//     const lastSeenTime = savedMsg.createdAt;

//     await UserModel.findByIdAndUpdate(senderId, { lastSeen: lastSeenTime });
//     await UserModel.findByIdAndUpdate(receiverId, { lastSeen: lastSeenTime });
//     await GroupModel.findByIdAndUpdate(receiverId, { lastSeen: lastSeenTime });

//     return res.status(200).json({
//       message: "Message sent successfully",
//       savedMsg,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Some error occurred" });
//   }
// };

// module.exports = { sendMessage };

const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text, recModel } = req.body;

    let media = null;
    let mediaType = null;

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
