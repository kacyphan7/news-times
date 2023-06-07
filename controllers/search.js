const express = require('express');
const router = express.Router();
const axios = require('axios');
const { search } = require('../models');

// Search page
router.get('/', (req, res) => {
    res.render('search');
});

router.post('/search', async function (req, res) {
    const category = req.body.category;

    if (category === 'apple') {
        // Make a request to fetch articles related to Apple
        const searchUrl = 'https://newsapi.org/v2/everything?q=apple&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const appleArticles = searchResponse.data.articles;

                if (appleArticles && appleArticles.length > 0) {
                    res.render('apple', {
                        articles: appleArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'apple', item: 'Apple' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else if (category === 'business') {
        // Make a request to fetch articles related to Business
        const searchUrl = 'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const businessArticles = searchResponse.data.articles;

                if (businessArticles && businessArticles.length > 0) {
                    res.render('business', {
                        business: businessArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'business', item: 'business' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else if (category === 'techCrunch') {
        // Make a request to fetch articles from TechCrunch
        const searchUrl = 'https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const techCrunchArticles = searchResponse.data.articles;

                if (techCrunchArticles && techCrunchArticles.length > 0) {
                    res.render('techCrunch', {
                        techCrunch: techCrunchArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'techCrunch', item: 'TechCrunch' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else if (category === 'wallStreet') {
        // Make a request to fetch articles from the Wall Street Journal
        const searchUrl = 'https://newsapi.org/v2/everything?domains=wsj.com&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const wallStreetArticles = searchResponse.data.articles;

                if (wallStreetArticles && wallStreetArticles.length > 0) {
                    res.render('wallStreet', {
                        wallStreet: wallStreetArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'wallStreet', item: 'Wall Street Journal' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else if (category === 'tesla') {
        // Make a request to fetch articles related to Tesla
        const searchUrl = 'https://newsapi.org/v2/everything?q=tesla&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const teslaArticles = searchResponse.data.articles;

                if (teslaArticles && teslaArticles.length > 0) {
                    res.render('tesla', {
                        tesla: teslaArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'tesla', item: 'Tesla' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else if (category === 'bitcoin') {
        // Make a request to fetch articles related to Bitcoin
        const searchUrl = 'https://newsapi.org/v2/everything?q=bitcoin&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const bitcoinArticles = searchResponse.data.articles;

                if (bitcoinArticles && bitcoinArticles.length > 0) {
                    res.render('bitcoin', {
                        bitcoin: bitcoinArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'bitcoin', item: 'Bitcoin' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else if (category === 'trump') {
        // Make a request to fetch articles related to Bitcoin
        const searchUrl = 'https://newsapi.org/v2/top-headlines?q=trump&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const trumpArticles = searchResponse.data.articles;

                if (trumpArticles && trumpArticles.length > 0) {
                    res.render('trump', {
                        trump: trumpArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'trump', item: 'Trump' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else if (category === 'us') {
        // Make a request to fetch top headlines in the US
        const searchUrl = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const usArticles = searchResponse.data.articles;

                if (usArticles && usArticles.length > 0) {
                    res.render('us', {
                        us: usArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'us', item: 'US' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else if (category === 'bbc') {
        // Make a request to fetch articles related to Bitcoin
        const searchUrl = 'https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const bbcArticles = searchResponse.data.articles;

                if (bbcArticles && bbcArticles.length > 0) {
                    res.render('bbc', {
                        bbc: bbcArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'bbc', item: 'Bbc' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else if (category === 'sources') {
        // Make a request to fetch articles related to Bitcoin
        const searchUrl = 'https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=' + apiKey;

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.status === 200) {
                const sourcesArticles = searchResponse.data.articles;

                if (sourcesArticles && sourcesArticles.length > 0) {
                    res.render('sources', {
                        sources: sourcesArticles,
                    });
                } else {
                    // Return no result page
                    return res.render('no-result', { category: 'sources', item: 'Sources' });
                }
            } else {
                res.status(searchResponse.status).send(searchResponse.data.message);
            }
        } catch (error) {
            res.status(500).send('An error occurred while fetching news articles');
        }
    } else {
        res.status(400).send('Invalid category');
    }
});

// PUT route for updating a search
router.put('/search/:id', async function (req, res) {
    try {
        const searchId = req.params.id;
        const updatedSearch = req.body;

        // Update the search in the database using the search model
        const result = await search.findByIdAndUpdate(searchId, updatedSearch);

        // Check if the search was found and updated
        if (result) {
            res.status(200).json({ message: 'Search updated successfully' });
        } else {
            res.status(404).json({ message: 'Search not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while updating the search' });
    }
});

// DELETE route for deleting a search
router.delete('/search/:id', async (req, res) => {
    try {
        const searchId = req.params.id;

        // Delete the search from the database using the search model
        const result = await search.findByIdAndDelete(searchId);

        // Check if the search was found and deleted
        if (result) {
            res.status(200).json({ message: 'Search deleted successfully' });
        } else {
            res.status(404).json({ message: 'Search not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while deleting the search' });
    }
});

module.exports = router;