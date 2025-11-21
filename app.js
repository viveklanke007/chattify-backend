// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const cookieParser = require("cookie-parser");
// const connectDB = require("./db/connectDB.js"); // Make sure this file exists
// const userApi = require("./routes/userApi.js"); // Make sure this file exists
// const msgApi = require("./routes/messageApi.js"); // Make sure this file exists
// const groupApi = require("./routes/groupApi.js"); // Make sure this file exists
// const http = require("http");
// const auth = require("./middleware/auth.js");
// const { Server } = require("socket.io");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(
//   "/avatar",
//   express.static(path.join(__dirname, "public/avatar"), {
//     maxAge: "7d",
//     etag: true,
//   }),
// );
// app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// app.use(express.json());
// app.use(cookieParser());

// // ✅ Create HTTP server from express
// const server = http.createServer(app);

// // ✅ Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // Map to track user status
// const onlineUsers = new Map();

// io.on("connection", (socket) => {
//   console.log("🟢 New client connected:", socket.id); // 1️⃣ User comes online

//   socket.on("userOnline", (userId) => {
//     if (!userId) return;
//     socket.userId = userId;
//     socket.join(userId);
//     onlineUsers.set(userId, socket.id);

//     console.log(`✅ User ${userId} joined room ${socket.id}`);
//     io.emit("onlineUsers", Array.from(onlineUsers.keys()));
//   }); // 2️⃣ Join group

//   socket.on("joinGroup", (groupId) => {
//     if (groupId) {
//       socket.join(groupId);
//       console.log(`👥 ${socket.userId} joined group ${groupId}`);
//     }
//   }); // 3️⃣ Send private message

//   socket.on("sendMessage", (msg) => {
//     // ✅ FIX: Destructure _id and rename it to messageId
//     const { senderId, receiverId, _id: messageId } = msg;
//     if (!receiverId || !senderId) return; // Send to receiver

//     io.to(receiverId).emit("newMessage", msg); // Update sender UI

//     io.to(senderId).emit("messageSentUpdate", { messageId }); // Now works
//     // If receiver online, auto-deliver

//     if (onlineUsers.has(receiverId)) {
//       io.to(senderId).emit("messageDeliveredUpdate", { messageId }); // Now works
//     }
//   }); // 4️⃣ Send group message

//   socket.on("sendGroupMessage", (msg) => {
//     const groupId = msg?.receiverId || msg?.groupId;
//     const messageId = msg._id; // ✅ FIX: Get the message ID
//     if (!groupId) return; // ✅ FIX: Send to all *other* members in the group room

//     socket.to(groupId).emit("newGroupMessage", msg); // ✅ FIX: Emit 'sent' status back to the original sender

//     if (socket.userId) {
//       io.to(socket.userId).emit("messageSentUpdate", { messageId });
//     }

//     console.log(`📢 Group message broadcast to group: ${groupId}`);
//   }); // 5️⃣ Receiver confirms message delivered

//   socket.on("messageDelivered", ({ messageId, senderId }) => {
//     if (senderId) {
//       io.to(senderId).emit("messageDeliveredUpdate", { messageId });
//     }
//   }); // 6️⃣ Receiver confirms message seen

//   socket.on("messageSeen", ({ messageId, senderId }) => {
//     if (senderId) {
//       io.to(senderId).emit("messageSeenUpdate", { messageId });
//     }
//   }); // 7️⃣ Typing events

//   socket.on("typing", ({ senderId, receiverId }) => {
//     // receiverId will be a UserID or a GroupID
//     io.to(receiverId).emit("showTyping", { senderId });
//   });

//   socket.on("stopTyping", ({ senderId, receiverId }) => {
//     io.to(receiverId).emit("hideTyping", { senderId });
//   }); // 8️⃣ Disconnect

//   socket.on("disconnect", () => {
//     console.log("🔴 Disconnected:", socket.id);
//     const userId = socket.userId;
//     if (userId) {
//       onlineUsers.delete(userId);
//       io.emit("onlineUsers", Array.from(onlineUsers.keys()));
//       io.emit("lastSeenUpdate", { userId, lastSeen: new Date() });
//       console.log(`📴 User ${userId} went offline.`);
//     }
//   });
// });

// // Make io accessible in routes
// app.set("io", io);

// // Connect to MongoDB before setting up routes
// (() => {
//   try {
//     connectDB();
//     console.log("✅ MongoDB connected successfully"); // Routes

//     app.use("/api/userApi", userApi);
//     app.use("/api/groupApi", groupApi);
//     app.use("/api/msgApi", msgApi);

//     app.get("/", (req, res) => {
//       res.send("Hello World!");
//     }); // Start HTTP + WebSocket server

//     server.listen(PORT, () => {
//       console.log(`🚀 Server running at http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Failed to connect to MongoDB:", err);
//     process.exit(1);
//   }
// })();

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const connectDB = require("./db/connectDB.js");
const userApi = require("./routes/userApi.js");
const msgApi = require("./routes/messageApi.js");
const groupApi = require("./routes/groupApi.js");

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------------------------------------------------
   CORS SETUP (LOCAL + PRODUCTION)
--------------------------------------------------------- */
const allowedOrigins = [
  "http://localhost:5173", // Your local frontend
  process.env.FRONTEND_URL, // Your deployed frontend (add in .env)
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

/* ---------------------------------------------------------
   STATIC FILES — REMOVED FOR RENDER
--------------------------------------------------------- */
// ❌ Render cannot store files in /public/uploads
// Use Cloudinary instead

/* ---------------------------------------------------------
   HTTP SERVER + SOCKET SERVER
--------------------------------------------------------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Attach io to express
app.set("io", io);

const onlineUsers = new Map();

/* ---------------------------------------------------------
   SOCKET.IO EVENTS
--------------------------------------------------------- */
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("userOnline", (userId) => {
    if (!userId) return;
    socket.userId = userId;
    socket.join(userId);
    onlineUsers.set(userId, socket.id);

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("joinGroup", (groupId) => {
    if (groupId) socket.join(groupId);
  });

  socket.on("sendMessage", (msg) => {
    const { senderId, receiverId, _id: messageId } = msg;
    if (!receiverId) return;

    io.to(receiverId).emit("newMessage", msg);
    io.to(senderId).emit("messageSentUpdate", { messageId });

    if (onlineUsers.has(receiverId)) {
      io.to(senderId).emit("messageDeliveredUpdate", { messageId });
    }
  });

  socket.on("sendGroupMessage", (msg) => {
    const groupId = msg.receiverId || msg.groupId;
    const messageId = msg._id;

    if (!groupId) return;

    socket.to(groupId).emit("newGroupMessage", msg);

    if (socket.userId) {
      io.to(socket.userId).emit("messageSentUpdate", { messageId });
    }
  });

  socket.on("messageDelivered", ({ messageId, senderId }) => {
    io.to(senderId).emit("messageDeliveredUpdate", { messageId });
  });

  socket.on("messageSeen", ({ messageId, senderId }) => {
    io.to(senderId).emit("messageSeenUpdate", { messageId });
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("showTyping", { senderId });
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("hideTyping", { senderId });
  });

  socket.on("disconnect", () => {
    const userId = socket.userId;
    if (userId) {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      io.emit("lastSeenUpdate", { userId, lastSeen: new Date() });
    }
  });
});

/* ---------------------------------------------------------
   ROUTES
--------------------------------------------------------- */
app.use("/api/userApi", userApi);
app.use("/api/groupApi", groupApi);
app.use("/api/msgApi", msgApi);

app.get("/", (req, res) => {
  res.send("Chat App Backend Running...");
});

/* ---------------------------------------------------------
   START SERVER
--------------------------------------------------------- */
(async () => {
  try {
    await connectDB(); // Await DB connection
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Failed", err);
    process.exit(1);
  }
})();
