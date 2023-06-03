const apiKey = process.env.NEWS_API_KEY;

// Handle the route for getting all articles mentioning Apple
exports.getAppleArticles = (req, res) => {
    axios.get('https://newsapi.org/v2/everything?q=apple&apiKey=' + apiKey)
        .then(function (response) {
            // handle success
            if (response.status === 200) {
                res.render('apple', { articles: response.data.articles });
            } else if (response.status === 404) {
                res.json({ message: 'No articles found.' });
            } else if (response.status === 401) {
                res.json({ message: 'Invalid API key.' });
            } else if (response.status === 504) {
                res.json({ message: 'Request timed out.' });
            }
        })
        .catch(function (error) {
            res.json({ message: error.message });
        });
};

// Handle the route for getting a single Apple article by author
exports.getSingleAppleArticle = (req, res) => {
    const decodedAuthor = decodeURIComponent(req.params.author);

    axios.get('https://newsapi.org/v2/everything?q=apple&apiKey=' + apiKey)
        .then(function (response) {
            let found = false;

            for (let i = 0; i < response.data.articles.length; i++) {
                let article = response.data.articles[i];

                if (article.author && article.author.toUpperCase() === decodedAuthor.toUpperCase()) {
                    res.render('single-apple', { article: article, articles: response.data.articles });
                    found = true;
                    break;
                }
            }

            if (!found) {
                res.render('apples', { message: 'Article does not exist.' });
            }
        })
        .catch(function (error) {
            res.render('apples', { message: 'Data not found. Please try again later.' });
        });
};

// Handle the route for getting top business headlines in the US
exports.getBusinessArticles = (req, res) => {
    axios.get('https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=' + apiKey)
        .then(function (response) {
            // handle success
            if (response.status === 200) {
                let business = response.data.articles;
                res.render('business', { business: business });
            } else if (response.status === 404) {
                res.json({ message: 'No articles found.' });
            } else if (response.status === 401) {
                res.json({ message: 'Invalid API key.' });
            } else if (response.status === 504) {
                res.json({ message: 'Request timed out.' });
            }
        })
        .catch(function (error) {
            res.json({ message: error.message });
        });
};