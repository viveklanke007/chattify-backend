require("dotenv").config();

const express = require("express");
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

const allowedOrigins = [
  "http://localhost:5173",
  "https://chattify-frontend-dep.vercel.app",
  "https://www.chattify-frontend-dep.vercel.app",
];

// GLOBAL CORS MIDDLEWARE – applies to ALL requests
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight instantly
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(
  "/avatar",
  express.static(path.join(__dirname, "public/avatar"), {
    maxAge: "7d",
    etag: true,
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
console.log("Allowed Origins:", allowedOrigins);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

const onlineUsers = new Map();

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

  socket.on("typing", ({ senderId, receiverId }) =>
    io.to(receiverId).emit("showTyping", { senderId }),
  );

  socket.on("stopTyping", ({ senderId, receiverId }) =>
    io.to(receiverId).emit("hideTyping", { senderId }),
  );

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
    await connectDB();
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running at PORT ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Failed", err);
    process.exit(1);
  }
})();
