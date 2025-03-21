const Message = require("../Model/messageModel");
const AppError = require("../Utils/AppError");
const mongoose = require("mongoose");

exports.sendMessage = async (req, res, next) => {
  console.log(req.body);
  try {
    // const {  } = req.body;

    // if (!messages) {
    //   return next(new AppError("messages fields are required", 400));
    // }

    const newMessage = await Message.create(req.body.messages);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Internal Server Error", 500));
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { sender, receiver } = req.query;

    if (!sender || !receiver) {
      return next(new AppError("Sender and receiver required", 400));
    }

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    return next(new AppError("Internal Server Error", 500));
  }
};
