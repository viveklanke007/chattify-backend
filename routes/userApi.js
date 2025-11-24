const express = require("express");
const router = express.Router();
const UserModel = require("../db/UserModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const GroupModel = require("../db/GroupModel.js");
const upload = require("../multerConfig/avatar.js"); // Import your multer config
const auth = require("../middleware/auth.js");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("req body", req.body);

    // Check if user already exists
    const isUser = await UserModel.findOne({ email });
    if (isUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new UserModel({
      username,
      email,
      password: hash,
    });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true only in production with https
      sameSite: "none",
      path: "/", // important for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("User registered");
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("req body", req.body);

    const user = await UserModel.findOne({ email }).select("+password"); // Include password
    if (!user) {
      return res.status(400).json({ message: "No user exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/", // important for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ✅ Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

router.use(auth);

router.post("/allUsers", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json({ message: "all users", users: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "fetching error" });
  }
});

router.post("/friendRqt", async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;
    console.log("body", senderId, receiverId);

    if (senderId === receiverId) {
      return res.status(201).json({ msg: "cant follow ourSelf" });
    }

    const userA = await UserModel.findById(senderId);
    const userB = await UserModel.findById(receiverId);

    if (
      userA.friendRequest.includes(receiverId) ||
      userA.friends.includes(receiverId)
    ) {
      res.status(200).json({ msg: "already friends" });
    }
    userB.friendRequest.push(senderId);
    await userB.save();

    res.status(200).json({ msg: "request send successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

//accept friend requesr
router.post("/acceptRqt", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    console.log("body", senderId, receiverId);

    const userA = await UserModel.findById(senderId);
    const userB = await UserModel.findById(receiverId);

    userB.friendRequest = userB.friendRequest.filter(
      (id) => id.toString() !== senderId,
    );

    userA.friends.push(receiverId);
    userB.friends.push(senderId);
    await userA.save();
    await userB.save();

    res.status(200).json({ data1: userA, data2: userB });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

//reject friend request
router.post("/rejectRqt", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    console.log("body", senderId, receiverId);

    const userB = await UserModel.findById(receiverId);

    userB.friendRequest = userB.friendRequest.filter(
      (id) => id.toString() !== senderId,
    );

    await userB.save();

    res.status(200).json({ msg: "rejected", data2: userB });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

//accept group request
router.post("/acceptGrpRqt", async (req, res) => {
  try {
    const { groupId, receiverId } = req.body;
    console.log("body", receiverId);

    const group = await GroupModel.findById(groupId);
    const user = await UserModel.findById(receiverId);

    user.groupRequest = user.groupRequest.filter(
      (req) => req.group.toString() !== groupId,
    );

    group.members.push(receiverId);
    user.groups.push(groupId);
    await group.save();
    await user.save();

    res.status(200).json({ data1: group });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

//reject group request
router.post("/rejectGrpRqt", async (req, res) => {
  try {
    const { groupId, receiverId } = req.body;
    console.log("body", receiverId);

    const user = await UserModel.findById(receiverId);

    user.groupRequest = user.groupRequest.filter(
      (req) => req.group.toString() !== groupId,
    );

    await user.save();

    res.status(200).json({ msg: "request rejected", data1: group });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

//request to join group
router.post("/joinGrpRqt", async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.body;
    console.log("body", groupId, userId);
    const group = await GroupModel.findById(groupId);
    const user = await UserModel.findById(userId);

    if (
      group.memberRequest.includes(userId) ||
      group.members.includes(userId) ||
      user.groupRequest.includes(groupId) ||
      user.groups.includes(groupId)
    ) {
      return res
        .status(400)
        .json({ message: "Already a member or request sent" });
    }
    group.memberRequest.push(userId);
    await group.save();
    res.status(200).json({ message: "Request sent successfully", group });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

router.post("/updateProfile", upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.user.id; // user ID from auth middleware
    const { bio, username } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let updated = false;

    // 1️⃣ If an avatar file is uploaded → upload to Cloudinary
    if (req.file) {
      // OPTIONAL: delete old avatar if stored in Cloudinary
      if (user.avatar && user.avatar.startsWith("https://res.cloudinary.com")) {
        const publicId = user.avatar.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`chatapp/avatars/${publicId}`);
      }

      // Upload the new avatar
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "chatapp/avatars",
        resource_type: "image",
        width: 300,
        height: 300,
        crop: "fill",
      });

      user.avatar = uploaded.secure_url; // 🔥 Save the Cloudinary URL
      updated = true;
    }

    // 2️⃣ Update bio and username
    if (typeof bio === "string" && bio.trim() !== "") {
      user.bio = bio.trim();
      updated = true;
    }

    if (typeof username === "string" && username.trim() !== "") {
      user.username = username.trim();
      updated = true;
    }

    if (!updated) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      avatar: user.avatar, // Cloudinary URL
      bio: user.bio,
      username: user.username,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

//exit group
router.post("/exitGrp", async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    console.log("body", groupId, userId);
    const group = await GroupModel.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true },
    );
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { groups: groupId } },
      { new: true },
    );

    await user.save();
    await group.save();
    res.status(200).json({ message: "exit group", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "some error" });
  }
});

//get user details
router.post("/getUserDetails", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "group", user: user });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Assuming `req.user` is added via middleware like passport/jwt or custom auth
router.post("/getCurrentDetails", async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Corrected this line
    console.log("User ID from token:", userId);

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Fetched user", user });
  } catch (err) {
    console.error("Error in getCurrentDetails:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//get friends list
router.post("/getUserFrds", async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId).populate("friends");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "group", user: user.friends });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
