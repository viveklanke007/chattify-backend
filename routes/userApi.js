// const express = require("express");
// const router = express.Router();
// const UserModel = require("../db/UserModel.js");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const GroupModel = require("../db/GroupModel.js");
// const upload = require("../multerConfig/avatar.js"); // Import your multer config
// const auth = require("../middleware/auth.js");
// require("dotenv").config();

// // ✅ Register Route
// router.post("/register", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     console.log("req body", req.body);

//     // Check if user already exists
//     const isUser = await UserModel.findOne({ email });
//     if (isUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Password hashing
//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(password, salt);

//     // Create new user
//     const newUser = new UserModel({
//       username,
//       email,
//       password: hash,
//     });
//     await newUser.save();

//     // Generate JWT token
//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     // Set token in httpOnly cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false, // true only in production with https
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     console.log("User registered");
//     res
//       .status(201)
//       .json({ message: "User registered successfully", user: newUser });
//   } catch (err) {
//     console.error("Registration error:", err);
//     res.status(500).json({ message: "Server error during registration" });
//   }
// });

// // ✅ Login Route
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log("req body", req.body);

//     const user = await UserModel.findOne({ email }).select("+password"); // Include password
//     if (!user) {
//       return res.status(400).json({ message: "No user exists" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Incorrect password" });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     // Set token in httpOnly cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//       path: "/",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.status(200).json({ message: "Login successful", user });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Server error during login" });
//   }
// });

// // ✅ Logout Route
// router.post("/logout", (req, res) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     secure: true,
//     sameSite: "lax",
//   });
//   res.status(200).json({ message: "Logged out successfully" });
// });

// router.use(auth);

// router.post("/allUsers", async (req, res) => {
//   try {
//     const users = await UserModel.find();
//     res.status(200).json({ message: "all users", users: users });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "fetching error" });
//   }
// });

// router.post("/friendRqt", async (req, res) => {
//   try {
//     const senderId = req.user.id;
//     const { receiverId } = req.body;
//     console.log("body", senderId, receiverId);

//     if (senderId === receiverId) {
//       return res.status(201).json({ msg: "cant follow ourSelf" });
//     }

//     const userA = await UserModel.findById(senderId);
//     const userB = await UserModel.findById(receiverId);

//     if (
//       userA.friendRequest.includes(receiverId) ||
//       userA.friends.includes(receiverId)
//     ) {
//       res.status(200).json({ msg: "already friends" });
//     }
//     userB.friendRequest.push(senderId);
//     await userB.save();

//     res.status(200).json({ msg: "request send successfully" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// //accept friend requesr
// router.post("/acceptRqt", async (req, res) => {
//   try {
//     const { senderId, receiverId } = req.body;
//     console.log("body", senderId, receiverId);

//     const userA = await UserModel.findById(senderId);
//     const userB = await UserModel.findById(receiverId);

//     userB.friendRequest = userB.friendRequest.filter(
//       (id) => id.toString() !== senderId,
//     );

//     userA.friends.push(receiverId);
//     userB.friends.push(senderId);
//     await userA.save();
//     await userB.save();

//     res.status(200).json({ data1: userA, data2: userB });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// //reject friend request
// router.post("/rejectRqt", async (req, res) => {
//   try {
//     const { senderId, receiverId } = req.body;
//     console.log("body", senderId, receiverId);

//     const userB = await UserModel.findById(receiverId);

//     userB.friendRequest = userB.friendRequest.filter(
//       (id) => id.toString() !== senderId,
//     );

//     await userB.save();

//     res.status(200).json({ msg: "rejected", data2: userB });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// //accept group request
// router.post("/acceptGrpRqt", async (req, res) => {
//   try {
//     const { groupId, receiverId } = req.body;
//     console.log("body", receiverId);

//     const group = await GroupModel.findById(groupId);
//     const user = await UserModel.findById(receiverId);

//     user.groupRequest = user.groupRequest.filter(
//       (req) => req.group.toString() !== groupId,
//     );

//     group.members.push(receiverId);
//     user.groups.push(groupId);
//     await group.save();
//     await user.save();

//     res.status(200).json({ data1: group });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// //reject group request
// router.post("/rejectGrpRqt", async (req, res) => {
//   try {
//     const { groupId, receiverId } = req.body;
//     console.log("body", receiverId);

//     const user = await UserModel.findById(receiverId);

//     user.groupRequest = user.groupRequest.filter(
//       (req) => req.group.toString() !== groupId,
//     );

//     await user.save();

//     res.status(200).json({ msg: "request rejected", data1: group });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// //request to join group
// router.post("/joinGrpRqt", async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { groupId } = req.body;
//     console.log("body", groupId, userId);
//     const group = await GroupModel.findById(groupId);
//     const user = await UserModel.findById(userId);

//     if (
//       group.memberRequest.includes(userId) ||
//       group.members.includes(userId) ||
//       user.groupRequest.includes(groupId) ||
//       user.groups.includes(groupId)
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Already a member or request sent" });
//     }
//     group.memberRequest.push(userId);
//     await group.save();
//     res.status(200).json({ message: "Request sent successfully", group });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// // both at same time
// router.post("/updateProfile", upload.single("avatar"), async (req, res) => {
//   try {
//     const userId = req.user.id; // ✅ Corrected this line
//     console.log("User ID from token:", userId);
//     const { bio, username } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Track if anything was updated
//     let updated = false;

//     // Update avatar if a file was uploaded
//     if (req.file) {
//       user.avatar = `/avatar/${req.file.filename}`;
//       updated = true;
//     }

//     // Update bio if provided
//     if (
//       (typeof bio === "string" && bio.trim() !== "") ||
//       (typeof username === "string" && username.trim() !== "")
//     ) {
//       user.bio = bio.trim();
//       user.username = username.trim();
//       updated = true;
//     }

//     if (!updated) {
//       return res.status(400).json({ message: "Nothing to update" });
//     }

//     await user.save();

//     res.status(200).json({
//       message: "Profile updated successfully",
//       avatar: user.avatar,
//       bio: user.bio,
//     });
//   } catch (err) {
//     console.error("Update profile error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// //exit group
// router.post("/exitGrp", async (req, res) => {
//   try {
//     const { groupId, userId } = req.body;
//     console.log("body", groupId, userId);
//     const group = await GroupModel.findByIdAndUpdate(
//       groupId,
//       { $pull: { members: userId } },
//       { new: true },
//     );
//     const user = await UserModel.findByIdAndUpdate(
//       userId,
//       { $pull: { groups: groupId } },
//       { new: true },
//     );

//     await user.save();
//     await group.save();
//     res.status(200).json({ message: "exit group", user });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// //get user details
// router.post("/getUserDetails", async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const user = await UserModel.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ message: "group", user: user });
//   } catch (err) {
//     console.log("error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Assuming `req.user` is added via middleware like passport/jwt or custom auth
// router.post("/getCurrentDetails", async (req, res) => {
//   try {
//     const userId = req.user.id; // ✅ Corrected this line
//     console.log("User ID from token:", userId);

//     const user = await UserModel.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ message: "Fetched user", user });
//   } catch (err) {
//     console.error("Error in getCurrentDetails:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// //get friends list
// router.post("/getUserFrds", async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await UserModel.findById(userId).populate("friends");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ message: "group", user: user.friends });
//   } catch (err) {
//     console.log("error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

// routes/userRoute.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const UserModel = require("../db/UserModel");
const GroupModel = require("../db/GroupModel");
const upload = require("../multerConfig/avatar"); // ⬅ FINAL multer (temp only)
const auth = require("../middleware/auth");

require("dotenv").config();

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Helper: remove temp file
const removeTempFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) console.log("Error removing temp file:", err.message);
  });
};

/* ---------------------------------------------------------
   REGISTER USER
--------------------------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new UserModel({ username, email, password: hash });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------------------------------------
   LOGIN USER
--------------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "none",
    //   path: "/",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true only on Render
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", user, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------------------------------------
   LOGOUT
--------------------------------------------------------- */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

// Protected routes
// router.use(auth);

/* ---------------------------------------------------------
   ALL USERS
--------------------------------------------------------- */
router.post("/allUsers", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Fetching error" });
  }
});

/* ---------------------------------------------------------
   SEND FRIEND REQUEST
--------------------------------------------------------- */
router.post("/friendRqt", async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId)
      return res.status(400).json({ msg: "Cannot add yourself" });

    const userA = await UserModel.findById(senderId);
    const userB = await UserModel.findById(receiverId);

    if (!userA || !userB)
      return res.status(404).json({ msg: "User not found" });

    if (userA.friends.includes(receiverId))
      return res.status(200).json({ msg: "Already friends" });

    userB.friendRequest.push(senderId);
    await userB.save();

    res.status(200).json({ msg: "Request sent" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

/* ---------------------------------------------------------
   ACCEPT FRIEND REQUEST
--------------------------------------------------------- */
router.post("/acceptRqt", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    const userA = await UserModel.findById(senderId);
    const userB = await UserModel.findById(receiverId);

    userB.friendRequest = userB.friendRequest.filter(
      (id) => id.toString() !== senderId.toString(),
    );

    userA.friends.push(receiverId);
    userB.friends.push(senderId);

    await userA.save();
    await userB.save();

    res.status(200).json({ userA, userB });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

/* ---------------------------------------------------------
   REJECT FRIEND REQUEST
--------------------------------------------------------- */
router.post("/rejectRqt", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    const userB = await UserModel.findById(receiverId);

    userB.friendRequest = userB.friendRequest.filter(
      (id) => id.toString() !== senderId.toString(),
    );

    await userB.save();

    res.status(200).json({ msg: "Request rejected" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

/* ---------------------------------------------------------
   UPDATE USER PROFILE (avatar + bio + username)
   CLOUDINARY VERSION (Render-safe)
--------------------------------------------------------- */
router.post("/updateProfile", upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, username } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let updated = false;

    // Upload avatar to Cloudinary
    if (req.file && req.file.path) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          folder: "chatify/user-avatars",
          resource_type: "image",
        });

        user.avatar = uploadRes.secure_url;
        updated = true;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({ message: "Avatar upload failed" });
      } finally {
        removeTempFile(req.file.path);
      }
    }

    // Update username/bio
    if (username?.trim()) {
      user.username = username.trim();
      updated = true;
    }
    if (bio?.trim()) {
      user.bio = bio.trim();
      updated = true;
    }

    if (!updated) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated",
      avatar: user.avatar,
      bio: user.bio,
      username: user.username,
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    if (req.file && req.file.path) removeTempFile(req.file.path);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------------------------------------
   GET USER DETAILS
--------------------------------------------------------- */
router.post("/getUserDetails", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------------------------------------
   GET CURRENT LOGGED-IN USER
--------------------------------------------------------- */
router.post("/getCurrentDetails", async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("getCurrentDetails error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------------------------------------
   GET FRIENDS LIST
--------------------------------------------------------- */
router.post("/getUserFrds", async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId).populate("friends");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ friends: user.friends });
  } catch (err) {
    console.error("getUserFrds error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
