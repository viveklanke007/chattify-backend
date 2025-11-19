// const express = require("express");
// const router = express.Router();
// const GroupModel = require("../db/GroupModel");
// const UserModel = require("../db/UserModel");
// const upload = require("../multerConfig/avatar"); // Import your multer config

// router.post("/createGrp", async (req, res) => {
//   try {
//     const { groupname, createdBy } = req.body;
//     console.log(groupname, createdBy);
//     const newGroup = new GroupModel({
//       groupname,
//       createdBy,
//       admins: [createdBy],
//       members: [createdBy],
//     });
//     const user = await UserModel.findByIdAndUpdate(
//       createdBy,
//       { groups: [newGroup._id] },
//       { new: true },
//     );
//     await newGroup.save();
//     await user.save();
//     res.json({ message: "Group created successfully", group: newGroup });
//   } catch (err) {
//     console.log("error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.post("/addMember", async (req, res) => {
//   try {
//     const { groupId, senderId, receiverId } = req.body;
//     const group = await GroupModel.findById(groupId);
//     if (!group) {
//       return res.status(400).json({ message: "No group exists" });
//     }

//     // Check if sender is admin
//     const isAdmin = group.admins.includes(senderId);
//     if (!isAdmin)
//       return res.status(403).json({ message: "You are not an admin" });

//     const user = await UserModel.findById(receiverId);

//     // Check if receiver is already a member or has an invitation
//     if (
//       group.members.includes(receiverId) ||
//       group.memberRequest.includes(receiverId) ||
//       user.groupRequest.includes(groupId)
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Already a member or invitation exists" });
//     }

//     user.groupRequest.push({ from: senderId, group: groupId });
//     await user.save();
//     res.status(200).json({ message: "Request sent successfully", user });
//   } catch (err) {
//     console.log("error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// //receiverIds
// router.post("/addMembers", async (req, res) => {
//   try {
//     const { groupId, senderId, receiverIds } = req.body; // receiverIds is an array

//     const group = await GroupModel.findById(groupId);
//     if (!group) {
//       return res.status(400).json({ message: "No group exists" });
//     }

//     // Check if sender is admin
//     const isAdmin = group.admins.includes(senderId);
//     if (!isAdmin) {
//       return res.status(403).json({ message: "You are not an admin" });
//     }

//     const alreadyMembers = [];
//     const alreadyRequested = [];
//     const success = [];

//     // Loop through all receiverIds
//     for (const receiverId of receiverIds) {
//       const user = await UserModel.findById(receiverId);

//       if (!user) continue;

//       // Check if user is already a member or has an existing request
//       if (
//         group.members.includes(receiverId) ||
//         group.memberRequest.includes(receiverId) ||
//         user.groupRequest.some((req) => req.group.toString() === groupId)
//       ) {
//         alreadyMembers.push(receiverId);
//         continue;
//       }

//       // Add request
//       user.groupRequest.push({ from: senderId, group: groupId });
//       await user.save();

//       success.push(receiverId);
//     }

//     return res.status(200).json({
//       message: "Requests processed successfully",
//       successCount: success.length,
//       alreadyMembersCount: alreadyMembers.length,
//       alreadyRequestedCount: alreadyRequested.length,
//       success,
//       alreadyMembers,
//       alreadyRequested,
//     });
//   } catch (err) {
//     console.error("error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Remove member from group (admin only)
// router.post("/removeMember", async (req, res) => {
//   try {
//     const { groupId, adminId, memberId } = req.body;
//     const group = await GroupModel.findById(groupId);
//     if (!group) {
//       return res.status(400).json({ message: "No group exists" });
//     }

//     // Check if adminId is actually an admin
//     const isAdmin = group.admins.includes(adminId);
//     if (!isAdmin)
//       return res.status(403).json({ message: "You are not an admin" });

//     // Check if member is in group
//     if (!group.members.includes(memberId)) {
//       return res
//         .status(400)
//         .json({ message: "User is not a member of this group" });
//     }

//     // Remove member from group
//     group.members = group.members.filter((id) => id.toString() !== memberId);
//     await group.save();

//     res.status(200).json({ message: "Member removed successfully", group });
//   } catch (err) {
//     console.log("error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// //accept member request
// router.post("/acceptMemberRqt", async (req, res) => {
//   try {
//     const { groupId, requester, accepter } = req.body;
//     console.log("body", requester, accepter);
//     const group = await GroupModel.findById(groupId);
//     const user = await UserModel.findById(requester);

//     // Check if accepter is admin
//     const isAdmin = group.admins.includes(accepter);
//     if (!isAdmin)
//       return res.status(403).json({ message: "You are not an admin" });

//     group.memberRequest = group.memberRequest.filter(
//       (req) => req.toString() !== requester,
//     );
//     group.members.push(requester);
//     user.groups.push(groupId);
//     await user.save();
//     await group.save();

//     res.status(200).json({ message: "Request accepted successfully", group });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// //reject member request
// router.post("/rejectMemberRqt", async (req, res) => {
//   try {
//     const { groupId, requester, accepter } = req.body;
//     console.log("body", requester, accepter);
//     const group = await GroupModel.findById(groupId);
//     const user = await UserModel.findById(requester);

//     // Check if accepter is admin
//     const isAdmin = group.admins.includes(accepter);
//     if (!isAdmin)
//       return res.status(403).json({ message: "You are not an admin" });

//     group.memberRequest = group.memberRequest.filter(
//       (req) => req.toString() !== requester,
//     );

//     await group.save();

//     res.status(200).json({ message: "Request rejrcted", group });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ msg: "some error" });
//   }
// });

// //get group details
// router.post("/getGrpDetails", async (req, res) => {
//   try {
//     const { groupId } = req.body;
//     const group = await GroupModel.findById(groupId);
//     if (!group) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ message: "group", grp: group });
//   } catch (err) {
//     console.log("error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// //get groups where user is member
// router.post("/getGroups", async (req, res) => {
//   try {
//     const userId = req.body.userId;
//     const groups = await GroupModel.find({ members: userId });
//     res.status(200).json({ message: "groups", grp: groups });
//   } catch (err) {
//     console.log("errror", err);
//   }
// });

// router.post("/updateProfile", upload.single("avatar"), async (req, res) => {
//   try {
//     const { bio, groupname, groupId } = req.body;

//     const group = await GroupModel.findById(groupId);
//     if (!group) {
//       return res.status(404).json({ message: "group not found" });
//     }

//     // Track if anything was updated
//     let updated = false;

//     // Update avatar if a file was uploaded
//     if (req.file) {
//       group.avatar = `/avatar/${req.file.filename}`;
//       updated = true;
//     }

//     // Update bio if provided
//     if (
//       (typeof bio === "string" && bio.trim() !== "") ||
//       (typeof groupname === "string" && groupname.trim() !== "")
//     ) {
//       group.bio = bio.trim();
//       group.groupname = groupname.trim();
//       updated = true;
//     }

//     if (!updated) {
//       return res.status(400).json({ message: "Nothing to update" });
//     }

//     await group.save();

//     res.status(200).json({
//       message: "Profile updated successfully",
//       avatar: group.avatar,
//       bio: group.bio,
//     });
//   } catch (err) {
//     console.error("Update profile error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

// routes/groupRoute.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const GroupModel = require("../db/GroupModel");
const UserModel = require("../db/UserModel");
const upload = require("../multerConfig/avatar"); // temp-storage multer

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

/**
 * Helper to delete local temp file (if exists)
 */
const removeTempFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) console.warn("Failed to remove temp file:", filePath, err.message);
  });
};

// Create Group
router.post("/createGrp", async (req, res) => {
  try {
    const { groupname, createdBy } = req.body;
    if (!groupname || !createdBy) {
      return res
        .status(400)
        .json({ message: "groupname and createdBy required" });
    }

    const newGroup = new GroupModel({
      groupname,
      createdBy,
      admins: [createdBy],
      members: [createdBy],
    });

    await newGroup.save();

    // Add group to user's groups array (push, don't overwrite)
    const user = await UserModel.findById(createdBy);
    if (user) {
      user.groups = user.groups || [];
      if (!user.groups.some((g) => g.toString() === newGroup._id.toString())) {
        user.groups.push(newGroup._id);
        await user.save();
      }
    }

    res.json({ message: "Group created successfully", group: newGroup });
  } catch (err) {
    console.error("createGrp error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send single invite (admin only)
router.post("/addMember", async (req, res) => {
  try {
    const { groupId, senderId, receiverId } = req.body;
    if (!groupId || !senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "groupId, senderId and receiverId required" });
    }

    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(400).json({ message: "No group exists" });

    const isAdmin = group.admins.some(
      (id) => id.toString() === senderId.toString(),
    );
    if (!isAdmin)
      return res.status(403).json({ message: "You are not an admin" });

    const user = await UserModel.findById(receiverId);
    if (!user)
      return res.status(404).json({ message: "Receiver user not found" });

    const alreadyMember = group.members.some(
      (id) => id.toString() === receiverId.toString(),
    );
    const alreadyRequestedInGroup =
      group.memberRequest &&
      group.memberRequest.some((id) => id.toString() === receiverId.toString());
    const alreadyRequestedInUser =
      user.groupRequest &&
      user.groupRequest.some(
        (r) => r.group && r.group.toString() === groupId.toString(),
      );

    if (alreadyMember || alreadyRequestedInGroup || alreadyRequestedInUser) {
      return res
        .status(400)
        .json({ message: "Already a member or invitation exists" });
    }

    // Keep user.groupRequest as array of objects { from, group }
    user.groupRequest = user.groupRequest || [];
    user.groupRequest.push({ from: senderId, group: groupId });
    await user.save();

    res.status(200).json({ message: "Request sent successfully", user });
  } catch (err) {
    console.error("addMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send multiple invites (receiverIds is array)
router.post("/addMembers", async (req, res) => {
  try {
    const { groupId, senderId, receiverIds } = req.body;
    if (!groupId || !senderId || !Array.isArray(receiverIds)) {
      return res
        .status(400)
        .json({ message: "groupId, senderId and receiverIds[] required" });
    }

    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(400).json({ message: "No group exists" });

    const isAdmin = group.admins.some(
      (id) => id.toString() === senderId.toString(),
    );
    if (!isAdmin)
      return res.status(403).json({ message: "You are not an admin" });

    const alreadyMembers = [];
    const alreadyRequested = [];
    const success = [];

    for (const receiverId of receiverIds) {
      const user = await UserModel.findById(receiverId);
      if (!user) continue;

      const memberExists = group.members.some(
        (id) => id.toString() === receiverId.toString(),
      );
      const groupReqExists =
        group.memberRequest &&
        group.memberRequest.some(
          (id) => id.toString() === receiverId.toString(),
        );
      const userReqExists =
        user.groupRequest &&
        user.groupRequest.some(
          (r) => r.group && r.group.toString() === groupId.toString(),
        );

      if (memberExists) {
        alreadyMembers.push(receiverId);
        continue;
      }

      if (groupReqExists || userReqExists) {
        alreadyRequested.push(receiverId);
        continue;
      }

      // Add request to user
      user.groupRequest = user.groupRequest || [];
      user.groupRequest.push({ from: senderId, group: groupId });
      await user.save();

      success.push(receiverId);
    }

    return res.status(200).json({
      message: "Requests processed successfully",
      successCount: success.length,
      alreadyMembersCount: alreadyMembers.length,
      alreadyRequestedCount: alreadyRequested.length,
      success,
      alreadyMembers,
      alreadyRequested,
    });
  } catch (err) {
    console.error("addMembers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove member from group (admin only)
router.post("/removeMember", async (req, res) => {
  try {
    const { groupId, adminId, memberId } = req.body;
    if (!groupId || !adminId || !memberId) {
      return res
        .status(400)
        .json({ message: "groupId, adminId and memberId required" });
    }

    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(400).json({ message: "No group exists" });

    const isAdmin = group.admins.some(
      (id) => id.toString() === adminId.toString(),
    );
    if (!isAdmin)
      return res.status(403).json({ message: "You are not an admin" });

    const memberExists = group.members.some(
      (id) => id.toString() === memberId.toString(),
    );
    if (!memberExists) {
      return res
        .status(400)
        .json({ message: "User is not a member of this group" });
    }

    group.members = group.members.filter(
      (id) => id.toString() !== memberId.toString(),
    );
    await group.save();

    res.status(200).json({ message: "Member removed successfully", group });
  } catch (err) {
    console.error("removeMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept member request (accepter must be admin)
router.post("/acceptMemberRqt", async (req, res) => {
  try {
    const { groupId, requester, accepter } = req.body;
    if (!groupId || !requester || !accepter) {
      return res
        .status(400)
        .json({ message: "groupId, requester and accepter required" });
    }

    const group = await GroupModel.findById(groupId);
    const user = await UserModel.findById(requester);
    if (!group || !user)
      return res.status(404).json({ message: "Group or requester not found" });

    const isAdmin = group.admins.some(
      (id) => id.toString() === accepter.toString(),
    );
    if (!isAdmin)
      return res.status(403).json({ message: "You are not an admin" });

    // remove from group's memberRequest (array of ObjectIds)
    group.memberRequest = (group.memberRequest || []).filter(
      (id) => id.toString() !== requester.toString(),
    );

    // add to members if not already
    if (!group.members.some((id) => id.toString() === requester.toString())) {
      group.members.push(requester);
    }

    // add group to user.groups if not present
    user.groups = user.groups || [];
    if (!user.groups.some((g) => g.toString() === groupId.toString())) {
      user.groups.push(groupId);
    }

    // Also remove request from user.groupRequest if it's stored there
    user.groupRequest = (user.groupRequest || []).filter(
      (r) => !(r.group && r.group.toString() === groupId.toString()),
    );

    await user.save();
    await group.save();

    res.status(200).json({ message: "Request accepted successfully", group });
  } catch (err) {
    console.error("acceptMemberRqt error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject member request
router.post("/rejectMemberRqt", async (req, res) => {
  try {
    const { groupId, requester, accepter } = req.body;
    if (!groupId || !requester || !accepter) {
      return res
        .status(400)
        .json({ message: "groupId, requester and accepter required" });
    }

    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.admins.some(
      (id) => id.toString() === accepter.toString(),
    );
    if (!isAdmin)
      return res.status(403).json({ message: "You are not an admin" });

    group.memberRequest = (group.memberRequest || []).filter(
      (id) => id.toString() !== requester.toString(),
    );
    await group.save();

    // Also remove from user's groupRequest if present
    const user = await UserModel.findById(requester);
    if (user) {
      user.groupRequest = (user.groupRequest || []).filter(
        (r) => !(r.group && r.group.toString() === groupId.toString()),
      );
      await user.save();
    }

    res.status(200).json({ message: "Request rejected", group });
  } catch (err) {
    console.error("rejectMemberRqt error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get group details
router.post("/getGrpDetails", async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) return res.status(400).json({ message: "groupId required" });

    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.status(200).json({ message: "group", grp: group });
  } catch (err) {
    console.error("getGrpDetails error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get groups where user is member
router.post("/getGroups", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const groups = await GroupModel.find({ members: userId });
    res.status(200).json({ message: "groups", grp: groups });
  } catch (err) {
    console.error("getGroups error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Update profile (avatar, bio, groupname)
 * - Uses multer temp storage in req.file.path
 * - Uploads to Cloudinary if file present
 */
router.post("/updateProfile", upload.single("avatar"), async (req, res) => {
  try {
    const { bio, groupname, groupId } = req.body;
    if (!groupId) return res.status(400).json({ message: "groupId required" });

    const group = await GroupModel.findById(groupId);
    if (!group) return res.status(404).json({ message: "group not found" });

    let updated = false;

    // Upload avatar to Cloudinary and remove temp file
    if (req.file && req.file.path) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          folder: "chatify/group-avatars",
          resource_type: "image",
        });

        group.avatar = uploadRes.secure_url;
        updated = true;
      } catch (upErr) {
        console.error("Cloudinary upload failed:", upErr);
        return res.status(500).json({ message: "Avatar upload failed" });
      } finally {
        // remove temp file
        removeTempFile(req.file.path);
      }
    }

    // Update bio & groupname
    if (typeof bio === "string" && bio.trim() !== "") {
      group.bio = bio.trim();
      updated = true;
    }

    if (typeof groupname === "string" && groupname.trim() !== "") {
      group.groupname = groupname.trim();
      updated = true;
    }

    if (!updated) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    await group.save();

    res.status(200).json({
      message: "Profile updated successfully",
      avatar: group.avatar,
      bio: group.bio,
      groupname: group.groupname,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    // Cleanup temp file if something went wrong and file still exists
    if (req.file && req.file.path) removeTempFile(req.file.path);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
