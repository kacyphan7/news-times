const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const { articles } = require('../models'); // Import the articles model or any other necessary dependencies

// GET /savedArticles - Display the saved articles page
router.get('/', isLoggedIn, async (req, res) => {
    try {
        // Retrieve the saved articles data from the database or any other data source
        const savedArticlesData = await articles.findAll({
            where: { author: req.user.id }, // Retrieve articles for the logged-in user
        });

        res.render('savedArticles', { savedArticles: savedArticlesData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// POST /savedArticles/add - Add a new article to the saved articles
router.post('/add', isLoggedIn, async (req, res) => {
    try {
        // Retrieve the article data from the request body
        const { title, content } = req.body;

        // Save the article to the database or any other data source
        await articles.create({
            author: req.user.id,
            title,
            content,
        });

        // Redirect back to the saved articles page
        res.redirect('/savedArticles');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// POST /savedArticles/delete/:id - Delete a saved article
router.post('/delete/:id', isLoggedIn, async (req, res) => {
    try {
        // Retrieve the article ID from the request parameters
        const { id } = req.params;

        // Delete the article from the database or any other data source
        await articles.destroy({
            where: { id, author: req.user.id }, // Delete the article for the logged-in user based on the ID and author
        });

        // Redirect back to the saved articles page
        res.redirect('/savedArticles');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

