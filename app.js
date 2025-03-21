const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./Controller/errorController");
const AppError = require("./Utils/AppError");
const cookieParser = require("cookie-parser");

const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const messageRoutes = require("./Routes/messageRoutes");

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1/messages", messageRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);
module.exports = { app };
