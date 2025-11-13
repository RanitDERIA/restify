const User = require("../models/user");
const passport = require("passport");

// Render Signup Page
module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};

// Handle Signup Logic
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });

        const registeredUser = await User.register(newUser, password);

        // Auto-login after signup
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Restify!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// Render Login Page
module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

// Handle Login Success (passport.authenticate is now in route file)
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to Restify!");

    const redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl; // Prevent reuse

    res.redirect(redirectUrl);
};

// Logout Handler
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "You are successfully logged out");
        res.redirect("/listings");
    });
};
