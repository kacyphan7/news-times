const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const isLoggedOut = require('../middleware/isLoggedOut');
const { user } = require('../models');

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

// Route that requires the user to be logged out
router.get('/signup', isLoggedOut, (req, res) => {
    // Render the signup page
    res.render('signup');
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
router.post('/profile', isLoggedIn, async (req, res) => {
    try {
        // Retrieve the updated profile data from the request body
        const { name, email, address, city, state, password } = req.body;

        // Update the user's profile in the database or any other data source
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.name = name;
        user.email = email;
        user.address = address;
        user.city = city;
        user.state = state;
        user.password = password;

        // Save the updated user profile
        await user.save();

        res.status(200).send('Profile updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// PUT /profile/update/:id - Update the user's profile
/* router.put('/:id', isLoggedIn, async (req, res) => {
    const putUserProfile = { ...req.user };

    putUserProfile.active = false;

    user.update(putUserProfile, {
        where: { id: req.params.id }

    })
        .then(() => {
            req.logOut(function (err, next) {
                if (err) { return next(err); }
                req.flash('success', 'Logging out... See you next time!');
                res.redirect('/');
            });
        })
        .catch((error) => {
            res.status(500).send('Internal Server Error');
        });
}); */

router.put('/update/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        // Retrieve the updated profile data from the request body
        const { name, email, address, city, state, password } = req.body;

        // Update the user's profile in the database or any other data source
        const user = await user.findByPk(id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the user's account is active
        user.name = name;
        user.email = email;
        user.address = address;
        user.city = city;
        user.state = state;
        user.password = password;

        // Save the updated user profile
        await user.save();

        res.status(200).send('Profile updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// DELETE /profile - Delete the user's profile
router.delete('/profile', isLoggedIn, async (req, res) => {
    try {
        const userId = req.params.id;

        // Delete the user's profile from the database
        await user.destroy({ where: { id: userId } });

        // Delete all saved articles associated with the user
        // await Article.destroy({ where: { userId } });

        // Redirect to the home page after successful deletion
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;