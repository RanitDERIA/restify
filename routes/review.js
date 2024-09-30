const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const reviewController = require("../controllers/reviews.js");
const { isLoggedIn } = require("../middleware"); // Import isLoggedIn middleware

// Route to create a new review for a specific listing
router.post("/", isLoggedIn, wrapAsync(reviewController.createReview));

// Route to render the edit form for a specific review
router.get("/:reviewId/edit", isLoggedIn, wrapAsync(reviewController.renderEditForm));

// Route to update a specific review
router.put("/:reviewId", isLoggedIn, wrapAsync(reviewController.updateReview));

// Route to delete a review
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.deleteReview));

module.exports = router;
