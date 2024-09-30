// models/reviews.js
const mongoose = require("mongoose");

// Define the Review schema
const reviewSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    author: {
        type: String, // Change this to String to store the username directly
        required: true,
    }
}, { timestamps: true });

// Create the Review model
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
