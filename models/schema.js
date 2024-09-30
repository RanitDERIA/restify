const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Listing schema
const listingSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true, // Trim whitespace from the beginning and end
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be a positive number"], // Ensure the price is positive
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true,
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[A-Za-z\s]+$/.test(v); // Validate that country contains only letters and spaces
            },
            message: props => `${props.value} is not a valid country name!`
        },
    },
    image: {
        url: {
            type: String,
            required: [true, "Image URL is required"],
        },
        filename: {
            type: String,
            required: [true, "Image filename is required"],
        }
    },
    category: {
        type: String,
        enum: ['trending', 'rooms', 'cities', 'mountains', 'castles', 'pools', 'camping', 'farms', 'arctic'],
        required: [true, "Category is required"],
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // GeoJSON type must be "Point"
            default: 'Point'
        },
        coordinates: {
            type: [Number], // Array of numbers: [longitude, latitude]
            required: true
        }
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review", // Reference the Review model
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference the User model
        required: true, // Ensure that every listing has an owner
    }
});

// Check if the model already exists and only create it if it doesn't
module.exports = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
