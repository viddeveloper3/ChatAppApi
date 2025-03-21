const express = require("express");
const { sendMessage, getMessages } = require("../Controller/messageController");
const router = express.Router();

router.route("/send").post(sendMessage);
router.route("/get").get(getMessages);

module.exports = router;
