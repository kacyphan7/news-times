const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const isLoggedOut = require('../middleware/isLoggedOut');
const { User, Article } = require('../models');

// GET /profile - Display the profile page
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const { id, name, email, address, city, state, password } = req.user; // Access the user object directly, no need for req.user.get()
        res.render('profile', { user: { id, name, email, address, city, state, password } });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// GET /profile/edit - Display the profile edit form
router.get('/edit', isLoggedIn, (req, res) => {
    res.render('profileEdit', { user: req.user });
});

// POST /profile/edit - Update the user's profile
router.post('/edit', isLoggedIn, async (req, res) => {
    try {
        // Retrieve the updated profile data from the request body
        const { name, email, address, city, state, password } = req.body;

        // Update the user's profile in the database or any other data source
        req.user.name = name;
        req.user.email = email;
        req.user.address = address;
        req.user.city = city;
        req.user.state = state;
        req.user.password = password;

        // Save the updated user profile
        await req.user.save();

        // Redirect back to the profile page
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// POST /profile - Update the user's profile
router.post('/', isLoggedIn, async (req, res) => {
    try {
        // Retrieve the updated profile data from the request body
        const { name, email, address, city, state, password } = req.body;

        // Update the user's profile in the database or any other data source
        req.user.name = name;
        req.user.email = email;
        req.user.address = address;
        req.user.city = city;
        req.user.state = state;
        req.user.password = password;

        // Save the updated user profile
        await req.user.save();

        // Log out the user
        req.logout(function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
            // No need for the else condition here

            // Redirect to the signup page after logout
            res.redirect('/signup');
        });

        // Redirect to the signup page
        res.redirect('/signup');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route that requires the user to be logged out
router.get('/signup', isLoggedOut, (req, res) => {
    // Render the signup page
    res.render('signup');
});


// DELETE /profile - Delete the user's profile
router.delete('/', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete the user's profile from the database
        await User.destroy({ where: { id: userId } });

        // Delete all saved articles associated with the user
        await Article.destroy({ where: { userId } });

        // Log out the user
        req.logout(function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
            // No need for the else condition here

            // Redirect to the signup page after logout
            res.redirect('/signup');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;