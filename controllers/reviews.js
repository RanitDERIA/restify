const Listing = require("../models/schema.js");
const Review = require("../models/reviews.js");
const ExpressError = require("../utils/ExpressError");

// Controller to handle review creation
module.exports.createReview = async (req, res) => {
    const { comment, rating } = req.body.review;
    const foundListing = await Listing.findById(req.params.id);

    if (!foundListing) throw new ExpressError("Listing not found", 404);

    // Create a new review with the author's username
    const review = new Review({
        comment,
        rating,
        listing: foundListing._id,
        author: req.user.username, // Store username as author
    });

    foundListing.reviews.push(review);
    await review.save();
    await foundListing.save();

    req.flash("success", "Review successfully added.");
    res.redirect(`/listings/${foundListing._id}`);
};

// Controller to render the edit form for a review
module.exports.renderEditForm = async (req, res) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    
    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${req.params.id}`);
    }
    
    if (review.author !== req.user.username) { // Check if the user is the author
        req.flash("error", "You do not have permission to edit this review");
        return res.redirect(`/listings/${req.params.id}`);
    }

    res.render("reviews/edit", { review }); // Render the edit form
};

// Controller to handle review update
module.exports.updateReview = async (req, res) => {
    const { reviewId } = req.params;
    const { comment, rating } = req.body.review;

    const updatedReview = await Review.findByIdAndUpdate(
        reviewId, 
        { comment, rating }, 
        { new: true, runValidators: true }
    );

    req.flash("success", "Review successfully updated");
    res.redirect(`/listings/${updatedReview.listing}`);
};

// Controller to handle review deletion
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError("Listing not found", 404);

    listing.reviews.pull(reviewId); // Remove review from listing's reviews array
    await listing.save();

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review successfully deleted.");
    res.redirect(`/listings/${id}`);
};
