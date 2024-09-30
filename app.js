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
const cloudinary = require('./cloudConfig');
const multer = require('multer');
const { storage } = require('./cloudConfig');
const upload = multer({ storage });
const helmet = require('helmet'); // Added Helmet for security

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to DB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit if DB connection fails
    }
}

main();

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Trust proxy for services like Render/Heroku
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Security: Helmet to set HTTP headers
app.use(helmet());

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// MongoDB Session Setup
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (e) => {
    console.log("ERROR in MONGO SESSION STORE:", e);
});

app.use(
    session({
        store: store,
        name: "session",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === "production",
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

app.get("/privacy", (req, res) => {
    res.render("privacy");
});

app.get("/terms", (req, res) => {
    res.render("terms");
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Page Not Found handler
app.use((req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode).render("error", { message: err.message || "Something went wrong", stack: process.env.NODE_ENV !== "production" ? err.stack : null });
});

// Server listening on port 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});
