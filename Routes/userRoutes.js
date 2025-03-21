const express = require("express");
const router = express.Router();
const userContoller = require("../Controller/userController");
const authController = require("../Authentication/authentication");

router.route("/users").get(userContoller.getAllUsers);
router.route("/users/:id").get(userContoller.getUser);
router.route("/users/:id").patch(userContoller.updateUser);
router.route("/users/:id").delete(userContoller.deleteUser);
router
  .route("/addfriend")
  .post(authController.authGuard, userContoller.addFriend);
router.route("/isLogedin").get(authController.isUserLogedIn);

module.exports = router;
