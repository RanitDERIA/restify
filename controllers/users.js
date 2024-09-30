const User = require("../models/user"); // Import the User model
const passport = require("passport");

// Controller to render the signup form
module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};

// Controller to handle signup logic
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });

        // Use passport-local-mongoose to register the user with hashed password
        const registeredUser = await User.register(newUser, password);

        // Automatically log in the user after successful registration
        req.login(registeredUser, (err) => {
            if (err) return next(err); // Handle login error
            req.flash("success", "Welcome to Restify!");
            res.redirect("/listings"); // Redirect to listings page after signup
        });
    } catch (e) {
        req.flash("error", e.message); // Handle registration error
        res.redirect("/signup"); // Redirect back to signup page in case of error
    }
};

// Controller to render the login form
module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

// Controller to handle login logic
module.exports.login = (req, res, next) => {
    // Store the original URL before authentication
    req.session.redirectUrl = req.originalUrl;

    passport.authenticate("local", { 
        failureRedirect: '/login', 
        failureFlash: true // Enable flash messages for login failures
    })(req, res, () => {
        req.flash("success", "Welcome back to Restify!");

        // Redirect to the originally requested URL or to the default listings page
        const redirectUrl = req.session.redirectUrl || "/listings";
        delete req.session.redirectUrl; // Clear the redirect URL after use
        res.redirect(redirectUrl);
    });
};

// Controller to handle logout logic
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); // Handle logout error
        }
        req.flash("success", "You are successfully logged out");
        res.redirect("/listings"); // Redirect to listings page after logout
    });
};
