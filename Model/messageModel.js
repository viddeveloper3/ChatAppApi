const mongoose = require("mongoose");

const message = new mongoose.Schema({
  text: { type: String }, // Message text
  sender: { type: String }, // Sender information
});

const messageSchema = new mongoose.Schema(
  {
    messages: {
      type: Map, // Use Map to dynamically store key-value pairs
      of: [message], // Each key will have an array of messages
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
