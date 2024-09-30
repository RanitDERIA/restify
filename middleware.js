// middleware.js
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Proceed if the user is authenticated
    }
    
    // Store the original URL in the session
    req.session.redirectUrl = req.originalUrl; 
    req.flash("error", "You must be logged in to do that!");
    res.redirect("/login"); // Redirect to the login page if not authenticated
}

module.exports = { isLoggedIn };
