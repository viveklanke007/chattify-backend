// const express = require("express");
// const router = express.Router();
// const MessageModel = require("../db/MessageModel");
// const upload = require("../multerConfig/multer");
// const { sendMessage } = require("../controlles/msgControler");

// //message sending with attachments
// router.post("/sendMsg", upload.single("file"), sendMessage);

// router.post("/deleteMsg", async (req, res) => {
//   try {
//     const { msgId } = req.body;
//     console.log("req body", req.body);

//     const msg = await MessageModel.findByIdAndDelete(msgId);
//     if (!msg) {
//       return res.status(400).json({ message: "No msg exists" });
//     }
//     res.status(200).json({ message: "successfully deleted", msg: msg });
//   } catch (err) {
//     console.error("some error:", err);
//     res.status(500).json({ message: "Server error during login" });
//   }
// });

// router.post("/getMsg", async (req, res) => {
//   try {
//     const { userA, userB, limit = 20, skip = 0 } = req.body;

//     // Add basic validation (optional but recommended)
//     if (!userA || !userB) {
//       return res.status(400).json({ msg: "userA and userB are required" });
//     }

//     const messages = await MessageModel.find({
//       $or: [
//         { senderId: userA, receiverId: userB },
//         { senderId: userB, receiverId: userA },
//       ],
//     })
//       .sort({ createdAt: -1 }) // Changed to newest first
//       .skip(skip)
//       .limit(limit);

//     res.status(200).json({ msg: messages });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// router.post("/getGrpMsg", async (req, res) => {
//   try {
//     const { groupId, limit = 20, skip = 0 } = req.body;

//     // Add basic validation
//     if (!groupId) {
//       return res.status(400).json({ msg: "groupId is required" });
//     }

//     const messages = await MessageModel.find({
//       receiverId: groupId,
//     })
//       .sort({ createdAt: -1 }) // Changed to newest first
//       .skip(skip)
//       .limit(limit);

//     res.status(200).json({ msg: messages });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// router.post("/clearChat", async (req, res) => {
//   try {
//     const { userA, userB } = req.body;
//     console.log("bodt is", userA, userB);

//     const msg = await MessageModel.deleteMany({
//       $or: [
//         { senderId: userA, receiverId: userB },
//         { senderId: userB, receiverId: userA },
//       ],
//     }).sort({ createdAt: 1 });
//     res.status(200).json({ msg: msg });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// router.post("/clearChatAll", async (req, res) => {
//   try {
//     const { userA, userB, groupId } = req.body;
//     if (!groupId) {
//       console.log("bodt is", userA, userB);

//       const msg = await MessageModel.deleteMany({
//         $or: [
//           { senderId: userA, receiverId: userB },
//           { senderId: userB, receiverId: userA },
//         ],
//       }).sort({ createdAt: 1 });
//       res.status(200).json({ msg: msg });
//     } else {
//       console.log("bodt is", groupId);

//       const msg = await MessageModel.deleteMany({ receiverId: groupId }).sort({
//         createdAt: 1,
//       });
//       res.status(200).json({ msg: msg });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// router.post("/clearChatGrp", async (req, res) => {
//   try {
//     const { groupId } = req.body;
//     console.log("bodt is", groupId);

//     const msg = await MessageModel.deleteMany({ receiverId: groupId }).sort({
//       createdAt: 1,
//     });
//     res.status(200).json({ msg: msg });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// router.post("/deleteManyMsg", async (req, res) => {
//   const { ids } = req.body;
//   console.log("ids is", ids);

//   if (ids.length === 0)
//     return res.status(200).json({ msg: "must be non empty" });
//   try {
//     const msg = await MessageModel.deleteMany({ _id: { $in: ids } });
//     res.status(200).json({ msg: msg });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// module.exports = router;

// routes/messageApi.js
const express = require("express");
const router = express.Router();

const MessageModel = require("../db/MessageModel");
const upload = require("../multerConfig/multer"); // temp upload for Cloudinary
const { sendMessage } = require("../controlles/msgControler");

// SEND MESSAGE (with file/media upload)
router.post("/sendMsg", upload.single("media"), sendMessage);

// DELETE SINGLE MESSAGE
router.post("/deleteMsg", async (req, res) => {
  try {
    const { msgId } = req.body;

    const msg = await MessageModel.findByIdAndDelete(msgId);
    if (!msg) {
      return res.status(400).json({ message: "No message exists" });
    }

    res.status(200).json({ message: "Successfully deleted", msg });
  } catch (err) {
    console.error("deleteMsg error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET PRIVATE CHAT MESSAGE
router.post("/getMsg", async (req, res) => {
  try {
    const { userA, userB, limit = 20, skip = 0 } = req.body;

    if (!userA || !userB) {
      return res.status(400).json({ msg: "userA and userB are required" });
    }

    const messages = await MessageModel.find({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ msg: messages });
  } catch (err) {
    console.error("getMsg error:", err);
    res.status(500).json({ msg: "some error" });
  }
});

// GET GROUP CHAT MESSAGES
router.post("/getGrpMsg", async (req, res) => {
  try {
    const { groupId, limit = 20, skip = 0 } = req.body;

    if (!groupId) {
      return res.status(400).json({ msg: "groupId is required" });
    }

    const messages = await MessageModel.find({ receiverId: groupId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ msg: messages });
  } catch (err) {
    console.error("getGrpMsg error:", err);
    res.status(500).json({ msg: "some error" });
  }
});

// CLEAR PRIVATE CHAT
router.post("/clearChat", async (req, res) => {
  try {
    const { userA, userB } = req.body;

    const msg = await MessageModel.deleteMany({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    });

    res.status(200).json({ msg });
  } catch (err) {
    console.error("clearChat error:", err);
    res.status(500).json({ msg: "some error" });
  }
});

// CLEAR PRIVATE CHAT OR GROUP CHAT
router.post("/clearChatAll", async (req, res) => {
  try {
    const { userA, userB, groupId } = req.body;

    let msg;

    if (groupId) {
      msg = await MessageModel.deleteMany({ receiverId: groupId });
    } else {
      msg = await MessageModel.deleteMany({
        $or: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      });
    }

    res.status(200).json({ msg });
  } catch (err) {
    console.error("clearChatAll error:", err);
    res.status(500).json({ msg: "some error" });
  }
});

// CLEAR GROUP CHAT ONLY
router.post("/clearChatGrp", async (req, res) => {
  try {
    const { groupId } = req.body;

    const msg = await MessageModel.deleteMany({ receiverId: groupId });

    res.status(200).json({ msg });
  } catch (err) {
    console.error("clearChatGrp error:", err);
    res.status(500).json({ msg: "some error" });
  }
});

// DELETE MULTIPLE MESSAGES
router.post("/deleteManyMsg", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ msg: "Ids array is required" });
    }

    const msg = await MessageModel.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ msg });
  } catch (err) {
    console.error("deleteManyMsg error:", err);
    res.status(500).json({ msg: "some error" });
  }
});

module.exports = router;
