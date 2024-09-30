if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const cloudinary = require('./cloudConfig'); // Include Cloudinary config
const multer = require('multer');
const { storage } = require('./cloudConfig'); // Import storage from cloudConfig
const upload = multer({ storage }); // Set up multer to use Cloudinary storage

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/restify";
const dbUrl = process.env.ATLASDB_URL;

// Async function to connect to MongoDB
async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to DB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

main();

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// MongoDB Session Setup
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: "mysupersecret"
    },
    touchAfter: 24 * 3600, 
});

// Error catcher
store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE");
    
})

// Session setup
app.use(
    session({
        store: store,
        secret: "mysupersecret",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        },
    })
);

// Flash middleware
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// EJS Mate for layouts
app.engine("ejs", ejsMate);

// Middleware to pass user and flash messages to all views
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.messages = req.flash();
    next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Privacy & terms routes (Before the 404 error handler)
app.get("/privacy", (req, res) => {
    res.render("privacy"); // Correctly render the 'privacy.ejs' view
});

app.get("/terms", (req, res) => {
    res.render("terms"); // Correctly render the 'terms.ejs' view
});

// Basic root route
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Middleware for Page Not Found (404) - this should be placed at the end
app.use((req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message } = err;
    res.status(statusCode).render("error", { message: message || "Something went wrong" });
});

// Server listening on port 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});
