const cloudinary = require('cloudinary').v2; // Import cloudinary
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

module.exports.index = async (req, res) => {
    const { category, search } = req.query; // Get the category and search query from the query string
    let filter = {};

    // If a category is selected, filter by that category
    if (category) {
        filter.category = category;
    }

    // If a search query is provided, filter by location or country
    if (search) {
        const regex = new RegExp(search, 'i'); // Case-insensitive regex
        filter.$or = [
            { location: regex },
            { country: regex }
        ];
    }

    try {
        const allListings = await Listing.find(filter); // Filter listings by category and search if provided
        res.render("listings/index.ejs", { allListings, selectedCategory: category }); // Pass selected category to the view
    } catch (error) {
        req.flash("error", "Error fetching listings: " + error.message);
        res.redirect("/listings");
    }
};

module.exports.createListing = async (req, res) => {
    const listingData = req.body.listing;

    // Handle file upload with Cloudinary
    try {
        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'restify' // Specify the folder name in Cloudinary
        });

        // Store the image URL and public ID in listingData
        listingData.image = {
            url: result.secure_url, // Get the secure URL from Cloudinary
            filename: result.public_id // Get the public ID from Cloudinary
        };
        listingData.owner = req.user._id; // Assign owner

        const newListing = new Listing(listingData);
        await newListing.save();
        req.flash("success", "Listing successfully created.");
        res.redirect(`/listings/${newListing._id}`);
    } catch (error) {
        console.error("Error saving listing:", error);
        req.flash("error", error.message);
        res.redirect("/listings/new");
    }
};

module.exports.showListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate('reviews')
        .populate('owner'); 

    if (!listing) throw new ExpressError("Listing not found", 404);

    const locale = listing.country === "India" ? "en-IN" : "en-US";
    const formattedPrice = listing.price.toLocaleString(locale, {
        style: "currency",
        currency: locale === "en-IN" ? "INR" : "USD",
    });

    res.render("listings/show", { listing, formattedPrice });
};

module.exports.editListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const updatedListing = req.body.listing;

    // Check if a new file has been uploaded
    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'restify'
            });

            updatedListing.image = {
                url: result.secure_url,
                filename: result.public_id
            };
        } catch (error) {
            req.flash("error", "Error uploading the image: " + error.message);
            return res.redirect(`/listings/${id}/edit`);
        }
    }

    try {
        const listing = await Listing.findById(id);

        // If there is a previous image, remove it from Cloudinary
        if (listing.image && listing.image.filename) {
            await cloudinary.uploader.destroy(listing.image.filename);
        }

        // Update the listing in the database
        const updated = await Listing.findByIdAndUpdate(id, updatedListing, {
            new: true,
            runValidators: true,
        });

        req.flash("success", "Successfully updated listing!");
        res.redirect(`/listings/${updated._id}`);
    } catch (error) {
        req.flash("error", error.message);
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.deleteListing = async (req, res) => {
    const deletedListing = await Listing.findByIdAndDelete(req.params.id);
    if (!deletedListing) throw new ExpressError("Listing not found", 404);
    req.flash("success", "Listing successfully deleted.");
    res.redirect("/listings");
};
