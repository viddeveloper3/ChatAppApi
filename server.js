const { app } = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const User = require("./Model/userModel");
const { parse } = require("path");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then((e) => console.log("Database sucessfully connected..."))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// WebSocket Server Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔥 New WebSocket Connection: ${socket.id}`);
  let userID;
  socket.on("registerUser", async (user_id) => {
    userID = user_id;
    await User.findByIdAndUpdate(user_id, {
      socketId: socket.id,
      active: true,
    });
    console.log(`User ${user_id} connected with socket ${socket.id}`);
  });

  socket.on("sendMessage", async (data) => {
    const parseData = JSON.parse(data);
    console.log(parseData);
    const receiver = await User.findById(parseData.reciverId);
    const { text, senderId, msg_name } = parseData;
    io.to(receiver.socketId).emit("receiveMessage", {
      text,
      senderId,
      msg_name,
    });
    console.log(`✅ Message sent to ${receiver.socketId}`);
  });

  socket.on("disconnect", async () => {
    await User.findByIdAndUpdate(userID, { active: false });
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
