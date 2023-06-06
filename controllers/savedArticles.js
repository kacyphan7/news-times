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

// PUT /savedArticles/update/:id - Update a saved article
router.put('/update/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        // Retrieve the updated article data from the request body
        const { title, content } = req.body;

        // Update the article in the database or any other data source
        const article = await Article.findByPk(id);
        if (!article) {
            return res.status(404).send('Article not found');
        }
        article.title = title;
        article.content = content;

        // Save the updated article
        await article.save();

        res.status(200).send('Article updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// PUT /savedArticles/move/:id - Move a saved article to a different category
router.put('/move/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        // Retrieve the new category data from the request body
        const { category } = req.body;

        // Update the article's category in the database or any other data source
        const article = await Article.findByPk(id);
        if (!article) {
            return res.status(404).send('Article not found');
        }
        article.category = category;

        // Save the updated article
        await article.save();

        res.status(200).send('Article moved to a different category successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// DELETE /savedArticles/delete/:id - Delete a saved article
router.delete('/delete/:id', isLoggedIn, async (req, res) => {
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
