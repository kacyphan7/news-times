// isLoggedOut.js

// Middleware function to check if the user is logged out
function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) {
        // If the user is not authenticated, proceed to the next middleware/route handler
        return next();
    } else {
        // If the user is authenticated, redirect them to a different page (e.g., homepage)
        return res.redirect('/');
    }
}

module.exports = isLoggedOut;