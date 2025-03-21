const express = require("express");
const router = express.Router();
const authentication = require("../Authentication/authentication");

router.route("/signup").post(authentication.signup);
router.route("/login").post(authentication.login);
router.route("/logout").get(authentication.logout);

module.exports = router;
