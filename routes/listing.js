const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings"); 
const multer = require("multer");
const { upload } = require("../cloudConfig"); // Import your upload middleware
const Listing = require("../models/schema.js");
const ExpressError = require("../utils/ExpressError");

// Authentication middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); 
    }
    req.session.redirectUrl = req.originalUrl; 
    req.flash("error", "You must be logged in to do that!");
    res.redirect("/login");
}

// Authorization middleware
async function isOwner(req, res, next) {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    if (listing.owner.equals(req.user._id)) {
        return next(); 
    }
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/listings/${req.params.id}`); 
}


// Routes
router.get("/", wrapAsync(listingController.index));
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new", { messages: req.flash() });
});

// Use multer upload middleware to handle image upload
router.post("/", isLoggedIn, upload.single('listing[image]'), wrapAsync(listingController.createListing));
router.get("/:id", wrapAsync(listingController.showListing));
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

// Add upload middleware for update
router.put("/:id", isLoggedIn, isOwner, upload.single('listing[image]'), wrapAsync(listingController.updateListing));
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;
