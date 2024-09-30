const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be a positive number"]
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true
    },
    image: {
        url: {
            type: String,
            required: [true, "Image URL is required"]
        },
        filename: {
            type: String, 
            required: [true, "Image filename is required"]
        }
    },
    category: {
        type: String,
        enum: ["trending", "rooms", "cities", "mountains", "castles", "pools", "camping", "farms", "arctic"],
        required: true // Ensures every listing has a category
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
