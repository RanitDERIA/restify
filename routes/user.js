const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.js"); // Import the controller

// Route to render the signup form
router.get("/signup", userController.renderSignup);

// Route to handle signup logic
router.post("/signup", userController.signup);

// Route to render the login form
router.get("/login", userController.renderLogin);

// Route to handle login logic
router.post("/login", userController.login);

// Logout Route
router.get("/logout", userController.logout);

module.exports = router;
