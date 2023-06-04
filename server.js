require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const axios = require('axios');
const app = express();
const ejsLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');
const fs = require('fs');
const usersDataPath = 'data/users.json';
const articlesDataPath = 'data/articles.json';

// environment variables 
const SECRET_SESSION = process.env.SECRET_SESSION;
const apiKey = process.env.NEWS_API_KEY;

// console.log('>>>>>>>>', SECRET_SESSION);

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);

app.use(flash()); // flash middleware

app.use(session({
  secret: SECRET_SESSION, // What we actually will be giving the user on our site as a session cookie
  resave: false, // Save the session even if it's modified, make this false
  saveUninitialized: true // If we have a new session, we save it, therefore making that true
}));

// add passport 
app.use(passport.initialize());      // Initialize passport
app.use(passport.session());         // Add a session

app.use((req, res, next) => {
  console.log(res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/auth', require('./controllers/auth'));

// Add this above /auth controllers
app.get('/profile', isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get();
  res.render('profile', { id, name, email });
});

app.get('/articles', isLoggedIn, (req, res) => {
  try {
    const userId = req.user.id; // Assuming user authentication middleware is used to populate req.user
    const userData = fs.readFileSync(usersDataPath, 'utf-8');
    const users = JSON.parse(userData);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const savedArticles = user.savedArticles.map((articleId) => {
      const articleData = fs.readFileSync(articlesDataPath, 'utf-8');
      const articles = JSON.parse(articleData);
      return articles.find((a) => a.id === articleId);
    });

    res.render('articles', { articles: savedArticles });
  } catch (error) {
    req.flash('error', 'Failed to retrieve saved articles');
    res.redirect('/');
  }
});

app.post('/articles', isLoggedIn, async (req, res) => {
  try {
    const { title, description, url, source } = req.body;

    // Create the article
    const article = { id: generateId(), title, description, url, source };

    // Save the article
    const articleData = fs.readFileSync(articlesDataPath, 'utf-8');
    const articles = JSON.parse(articleData);
    articles.push(article);
    fs.writeFileSync(articlesDataPath, JSON.stringify(articles, null, 2), 'utf-8');

    // Update the user's saved articles
    const userId = req.user.id; // Assuming user authentication middleware is used to populate req.user
    const userData = fs.readFileSync(usersDataPath, 'utf-8');
    const users = JSON.parse(userData);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.savedArticles.push(article.id);
    fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2), 'utf-8');

    req.flash('success', 'Article saved successfully');
    res.redirect('/');
  } catch (error) {
    req.flash('error', 'Failed to save the article');
    res.redirect('/');
  }
});

// Add article to saved list
app.post('/save-article', isLoggedIn, (req, res) => {
  try {
    const userId = req.user.id; // Assuming user authentication middleware is used to populate req.user
    const articleId = req.body.articleId;

    // Retrieve user data
    const userData = fs.readFileSync(usersDataPath, 'utf-8');
    const users = JSON.parse(userData);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the article is already saved
    if (user.savedArticles.includes(articleId)) {
      return res.status(400).json({ error: 'Article already saved' });
    }

    // Add the article to the saved list
    user.savedArticles.push(articleId);
    fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2), 'utf-8');

    res.json({ message: 'Article saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save the article' });
  }
});

// Remove article from saved list
app.post('/delete-article', isLoggedIn, (req, res) => {
  try {
    const userId = req.user.id; // Assuming user authentication middleware is used to populate req.user
    const articleId = req.body.articleId;

    // Retrieve user data
    const userData = fs.readFileSync(usersDataPath, 'utf-8');
    const users = JSON.parse(userData);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the article is saved
    const articleIndex = user.savedArticles.indexOf(articleId);
    if (articleIndex === -1) {
      return res.status(400).json({ error: 'Article not found in saved list' });
    }

    // Remove the article from the saved list
    user.savedArticles.splice(articleIndex, 1);
    fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2), 'utf-8');

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete the article' });
  }
});

app.put('/articles/save', isLoggedIn, (req, res) => {
  try {
    const articleAuthor = req.body.articleAuthor; // Assuming the article author is sent in the request body
    const userId = req.user.id; // Assuming user authentication middleware is used to populate req.user

    // Update the user's saved articles
    const userData = fs.readFileSync(usersDataPath, 'utf-8');
    const users = JSON.parse(userData);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the article is already saved by the user
    if (user.savedArticles.includes(articleAuthor)) {
      return res.status(400).json({ error: 'Article already saved' });
    }

    user.savedArticles.push(articleAuthor);
    fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2), 'utf-8');

    res.json({ message: 'Article saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save the article' });
  }
});

app.put('/articles/:author', isLoggedIn, (req, res) => {
  try {
    const author = req.params.author;
    const { title, description, url, source } = req.body;

    // Update the article in your data source based on the author

    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update the article' });
  }
});

app.put('/articles/:articleAuthor/read', isLoggedIn, (req, res) => {
  try {
    const articleAuthor = req.params.articleAuthor;
    const userId = req.user.id; // Assuming user authentication middleware is used to populate req.user

    // Update the user's read articles
    const userData = fs.readFileSync(usersDataPath, 'utf-8');
    const users = JSON.parse(userData);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the article is already marked as read by the user
    if (user.readArticles.includes(articleAuthor)) {
      return res.status(400).json({ error: 'Article already marked as read' });
    }

    user.readArticles.push(articleAuthor);
    fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2), 'utf-8');

    res.json({ message: 'Article marked as read successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark the article as read' });
  }
});

app.delete('/articles/:articleAuthor/unsave', isLoggedIn, (req, res) => {
  try {
    const articleAuthor = req.params.articleAuthor;
    const userId = req.user.id; // Assuming user authentication middleware is used to populate req.user

    // Update the user's saved articles
    const userData = fs.readFileSync(usersDataPath, 'utf-8');
    const users = JSON.parse(userData);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the article from the user's saved articles based on the author name
    const index = user.savedArticles.findIndex((article) => article.author === articleAuthor);
    if (index !== -1) {
      user.savedArticles.splice(index, 1);
      fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2), 'utf-8');
    }

    res.json({ message: 'Article un-saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to un-save the article' });
  }
});

function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// All articles mentioning Apple 
app.get('/apple', function (req, res) {
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
});


// Get a single apple by author
app.get('/apple/:author', function (req, res) {
  const decodedAuthor = decodeURIComponent(req.params.author); // Decode the author parameter

  axios.get('https://newsapi.org/v2/everything?q=apple&apiKey=' + apiKey)
    .then(function (response) {
      let found = false;

      for (let i = 0; i < response.data.articles.length; i++) {
        let article = response.data.articles[i];

        if (article.author && article.author.toUpperCase() === decodedAuthor.toUpperCase()) {
          res.render('single-apple', { article: article, articles: response.data.articles });
          found = true;
          break; // Exit the loop once the article is found
        }
      }

      if (!found) {
        res.render('apples', { message: 'Article does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('apples', { message: 'Data not found. Please try again later.' });
    });
});

// Top business headlines in the US right now
app.get('/business', function (req, res) {
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
});

// Get a single business by author
app.get('/business/:author', function (req, res) {
  const decodedAuthor = decodeURIComponent(req.params.author); // Decode the author parameter

  axios.get('https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=' + apiKey)
    .then(function (response) {
      let found = false;

      for (let i = 0; i < response.data.articles.length; i++) {
        let article = response.data.articles[i];

        if (article.author && article.author.toUpperCase() === req.params.author.toUpperCase()) {
          res.render('single-business', { business: article, articles: response.data.articles });
          found = true;
          break; // Exit the loop once the article is found
        }
      }

      if (!found) {
        res.render('business', { message: 'Article does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('business', { message: 'Data not found. Please try again later.' });
    });
});

// Top headlines from TechCrunch right now
app.get('/techCrunch', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        let techCrunch = response.data.articles;
        res.render('techCrunch', { techCrunch: techCrunch });
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
});

// Get a single TechCrunch by author
app.get('/techCrunch/:author', function (req, res) {
  const decodedAuthor = decodeURIComponent(req.params.author);

  axios.get('https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=' + apiKey)
    .then(function (response) {
      let found = false;

      for (let i = 0; i < response.data.articles.length; i++) {
        let article = response.data.articles[i];

        if (article.author && article.author.toUpperCase() === decodedAuthor.toUpperCase()) {
          res.render('single-techCrunch', { techCrunch: article, articles: response.data.articles });
          found = true;
          break;
        }
      }

      if (!found) {
        res.render('techCrunch', { message: 'Article does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('techCrunch', { message: 'Data not found. Please try again later.' });
    });
});

// All articles published by the Wall Street Journal in the last 6 months, sorted by recent first
app.get('/wallStreet', function (req, res) {
  axios.get('https://newsapi.org/v2/everything?domains=wsj.com&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        let wallStreet = response.data.articles;
        res.render('wallStreet', { wallStreet: wallStreet });
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
});

// Get a single wallStreet by author
app.get('/wallStreet/:author', function (req, res) {
  const decodedAuthor = decodeURIComponent(req.params.author);

  axios.get('https://newsapi.org/v2/everything?domains=wsj.com&apiKey=' + apiKey)
    .then(function (response) {
      let foundArticle = null;

      for (let i = 0; i < response.data.articles.length; i++) {
        let article = response.data.articles[i];

        if (article.author && article.author.toUpperCase() === decodedAuthor.toUpperCase()) {
          foundArticle = article;
          break;
        }
      }

      if (foundArticle) {
        res.render('single-wallStreet', { article: foundArticle, articles: response.data.articles });
      } else {
        res.render('wallStreet', { message: 'Article does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('wallStreet', { message: 'Data not found. Please try again later.' });
    });
});

// All articles about Tesla from the last month, sorted by recent first
app.get('/tesla', function (req, res) {
  axios.get('https://newsapi.org/v2/everything?q=tesla&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        let tesla = response.data.articles;
        res.render('tesla', { tesla: tesla });
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
});

// Get a single tesla by author
app.get('/tesla/:author', function (req, res) {
  const decodedAuthor = decodeURIComponent(req.params.author);

  axios.get('https://newsapi.org/v2/everything?q=tesla&apiKey=' + apiKey)
    .then(function (response) {
      let foundArticle = null;

      for (let i = 0; i < response.data.articles.length; i++) {
        let article = response.data.articles[i];

        if (article.author && article.author.toUpperCase() === decodedAuthor.toUpperCase()) {
          foundArticle = article;
          break;
        }
      }

      if (foundArticle) {
        res.render('single-tesla', { article: foundArticle, articles: response.data.articles });
      } else {
        res.render('tesla', { message: 'Article does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('tesla', { message: 'Data not found. Please try again later.' });
    });
});

// All articles about Bitcoin
app.get('/bitcoin', function (req, res) {
  axios.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        let bitcoin = response.data.articles;
        res.render('bitcoin', { bitcoin: bitcoin });
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
});

// Get a single bitcoin by author
app.get('/bitcoin/:author', function (req, res) {
  const decodedAuthor = decodeURIComponent(req.params.author);

  axios.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=' + apiKey)
    .then(function (response) {
      let foundArticle = null;

      for (let i = 0; i < response.data.articles.length; i++) {
        let article = response.data.articles[i];

        if (article.author && article.author.toUpperCase() === decodedAuthor.toUpperCase()) {
          foundArticle = article;
          break;
        }
      }

      if (foundArticle) {
        res.render('single-bitcoin', { article: foundArticle, articles: response.data.articles });
      } else {
        res.render('bitcoin', { message: 'Article does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('bitcoin', { message: 'Data not found. Please try again later.' });
    });
});

// All sources
app.get('/sources', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines/sources?&apiKey=' + apiKey)
    .then(function (response) {
      if (response.status === 200) {
        res.render('sources', { sources: response.data.sources });
      } else if (response.status === 404) {
        res.json({ message: 'No sources found.' });
      } else if (response.status === 401) {
        res.json({ message: 'Invalid API key.' });
      } else if (response.status === 504) {
        res.json({ message: 'Request timed out.' });
      }
    })
    .catch(function (error) {
      res.json({ message: error.message });
    });
});

// get a single source by name 
app.get('/sources/:name', function (req, res) {
  const decodedName = decodeURIComponent(req.params.name);

  axios.get('https://newsapi.org/v2/top-headlines/sources?&apiKey=' + apiKey)
    .then(function (response) {
      let foundSource = null;

      for (let i = 0; i < response.data.sources.length; i++) {
        let source = response.data.sources[i];

        if (source.name && source.name.toUpperCase() === decodedName.toUpperCase()) {
          foundSource = source;
          break;
        }
      }

      if (foundSource) {
        res.render('single-source', { source: foundSource, sources: response.data.sources });
      } else {
        res.render('sources', { message: 'Source does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('sources', { message: 'Data not found. Please try again later.' });
    });
});

// Top headlines in the US
app.get('/us', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        let us = response.data.articles;
        res.render('us', { us: us });
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
});

// create us/search
app.get('/us/search', function (req, res) {
  return res.render('us/search');
});

// get a single US News by author 
app.get('/us/:author', function (req, res) {
  const decodedAuthor = decodeURIComponent(req.params.author);

  axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=' + apiKey)
    .then(function (response) {
      let foundArticle = null;

      for (let i = 0; i < response.data.articles.length; i++) {
        let article = response.data.articles[i];

        if (article.author && article.author.toUpperCase() === decodedAuthor.toUpperCase()) {
          foundArticle = article;
          break;
        }
      }

      if (foundArticle) {
        res.render('single-usNews', { article: foundArticle, articles: response.data.articles });
      } else {
        res.render('us', { message: 'Article does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('us', { message: 'Data not found. Please try again later.' });
    });
});

// post US News 
/* app.post('/us', function (req, res) {
  console.log('form data', req.body);
  axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=' + apiKey)
    .then(function (response) {
      const searchData = req.body;
      const articles = response.data.articles;

      if (searchData.category === 'author') {
        const authorUs = articles.filter(function (article) {
          return article.author && article.author.toLowerCase().includes(searchData.item.toLowerCase());
        });
        res.render('/us', { bbc: authorUs });
      } else if (searchData.category === 'title') {
        const titleUs = articles.filter(function (article) {
          return article.title && article.title.toLowerCase().includes(searchData.item.toLowerCase());
        });
        res.render('/us', { bbc: titleUs });
      } else if (searchData.category === 'publishedAt') {
        const publishedAtUs = articles.filter(function (article) {
          return article.publishedAt && article.publishedAt.includes(searchData.item);
        });
        res.render('/us', { bbc: publishedAtUs });
      }
    })
    .catch(function (error) {
      res.json({ message: 'Data not found. Please try again later.' });
    });
}); */

// Top headlines from BBC News
app.get('/bbc', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        const bbc = response.data.articles;
        res.render('bbc', { bbc: bbc });
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
});

// create bbc/search
app.get('/bbc/search', function (req, res) {
  return res.render('bbc/search');
});

// get a single BBC News by author
app.get('/bbc/:author', function (req, res) {
  const decodedAuthor = decodeURIComponent(req.params.author);

  axios.get('https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=' + apiKey)
    .then(function (response) {
      let foundArticle = null;

      for (let i = 0; i < response.data.articles.length; i++) {
        let article = response.data.articles[i];

        if (article.author && article.author.toUpperCase() === decodedAuthor.toUpperCase()) {
          foundArticle = article;
          break;
        }
      }

      if (foundArticle) {
        res.render('single-bbcNews', { article: foundArticle, articles: response.data.articles });
      } else {
        res.render('bbc', { message: 'Article does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('bbc', { message: 'Data not found. Please try again later.' });
    });
});

// post BBC News 
/* app.post('/bbc/search', function (req, res) {
  console.log('form data', req.body);
  axios.get('https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=' + apiKey)
    .then(function (response) {
      const searchData = req.body;
      const articles = response.data.articles;

      if (searchData.category === 'author') {
        const authorBbc = articles.filter(function (article) {
          return article.author && article.author.toLowerCase().includes(searchData.item.toLowerCase());
        });
        res.render('/bbc', { bbc: authorBbc });
      } else if (searchData.category === 'title') {
        const titleBbc = articles.filter(function (article) {
          return article.title && article.title.toLowerCase().includes(searchData.item.toLowerCase());
        });
        res.render('/bbc', { bbc: titleBbc });
      } else if (searchData.category === 'publishedAt') {
        const publishedAtBbc = articles.filter(function (article) {
          return article.publishedAt && article.publishedAt.includes(searchData.item);
        });
        res.render('/bbc', { bbc: publishedAtBbc });
      }
    })
    .catch(function (error) {
      res.json({ message: 'Data not found. Please try again later.' });
    });
}); */
// search by keyword instead of title  2023-06-02 // switch case && for each loop to look up item
app.post('/bbc', function (req, res) {
  console.log('form data', req.body);
  axios.get('https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=' + apiKey)
    .then(function (response) {
      if (req.body.category === 'author') {
        for (let i = 0; i < response.data.length; i++) {
          let bbc = response.data[i];
          if (bbc.author === req.body.item) {
            return res.redirect(`/bbc/${bbc.author}`);
          }
        }
      } else if (req.body.category === 'title') { // dont have to search exact title; do keyword
        const titleBbc = response.data.filter(function (bbc) {
          console.log('-------------');
          console.log('bbc', bbc);
          console.log('title', bbc.title);
          console.log('item', req.body.item);
          if (bbc.title.includes(req.body.item)) {
            return true;
          } else {
            return false;
          }
        });
        res.render('bbc', { bbc: titleBbc });
      } else if (req.body.category === 'publishedAt') {
        const publishedAtBbc = response.data.filter(function (bbc) {
          console.log('-------------');
          console.log('bbc', bbc);
          console.log('publishedAt', bbc.publishedAt);
          console.log('item', req.body.item);
          if (bbc.publishedAt === req.body.item) {
            return true;
          } else {
            return false;
          }
        });
        res.render('bbc', { bbc: publishedAtBbc });
      }
    })
    .catch(function (error) {
      res.json({ message: 'Data not found. Please try again later.' });
    });
});

// Top headlines about Trump
app.get('/trump', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines?q=trump&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        let trump = response.data.articles;
        res.render('trump', { trump: trump });
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
});

// get a single Trump by author
app.get('/trump/:author', function (req, res) {
  const decodedAuthor = decodeURIComponent(req.params.author);

  axios.get('https://newsapi.org/v2/top-headlines?q=trump&apiKey=' + apiKey)
    .then(function (response) {
      let foundArticle = null;

      for (let i = 0; i < response.data.articles.length; i++) {
        let article = response.data.articles[i];

        if (article.author && article.author.toUpperCase() === decodedAuthor.toUpperCase()) {
          foundArticle = article;
          break;
        }
      }

      if (foundArticle) {
        res.render('single-trump', { article: foundArticle, articles: response.data.articles });
      } else {
        res.render('trump', { message: 'Article does not exist.' });
      }
    })
    .catch(function (error) {
      res.render('trump', { message: 'Data not found. Please try again later.' });
    });
});

// Search page
app.get('/search', (req, res) => {
  res.render('search');
});

app.post('/search', async function (req, res) {
  const categories = [
    'apple',
    'business',
    'techCrunch',
    'wallStreet',
    'tesla',
    'bitcoin',
    'sources',
    'us',
    'bbc',
    'trump',
  ];

  const category = req.body.category;

  if (!categories.includes(category)) {
    res.status(400).send('Invalid category');
    return;
  }

  const searchUrl = `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${apiKey}`;

  const searchResponse = await axios.get(searchUrl);

  if (searchResponse.status === 200) {
    const newsArticles = searchResponse.data.articles;

    if (newsArticles.length === 0) {
      return res.render('no-result', { category });
    }

    res.render('search', {
      newsArticles,
      category,
    });
  } else {
    res.status(searchResponse.status).send(searchResponse.data.message);
  }
});

// language and country not require 
/* app.post('/search', async function (req, res) {
  try {
    const appleSearch = await axios.get('https://newsapi.org/v2/everything?q=apple&apiKey=' + apiKey);
    const businessSearch = await axios.get('https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=' + apiKey);
    const techCrunchSearch = await axios.get('https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=' + apiKey);
    const wallStreetSearch = await axios.get('https://newsapi.org/v2/everything?domains=wsj.com&apiKey=' + apiKey);
    const teslaSearch = await axios.get('https://newsapi.org/v2/everything?q=tesla&apiKey=' + apiKey);
    const bitcoinSearch = await axios.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=' + apiKey);
    const sourcesSearch = await axios.get('https://newsapi.org/v2/top-headlines/sources?&apiKey=' + apiKey);
    const usNewsSearch = await axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=' + apiKey);
    const bbcNewsSearch = await axios.get('https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=' + apiKey);
    const trumpSearch = await axios.get('https://newsapi.org/v2/top-headlines?q=trump&apiKey=' + apiKey);

    let result = [];
    // inputData.name = inputData.name.toLowerCase()
    const inputData = { ...req.body };
    inputData.name = inputData.name.toLowerCase();
    console.log('print ------->', inputData);
    switch (inputData.name) {
      case 'apple':
        appleSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
      case 'business':
        // businessSearch.data.forEach((element) => {
        // console.log(element);
        // for (let key in element) {
        // if (key === req.body.category && element[key] === null) {
        // result.push(element);
        // ontinue;
        // } else if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
        return res.redirect(`/business`);

        break;
        break;
      case 'techCrunch':
        // techCrunchSearch.data.forEach((element) => {
        // console.log(element);
        // for (let key in element) {
        // if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
        return res.redirect(`/techCrunch`);

        break;
      case 'wallStreet':
        // wallStreetSearch.data.forEach((element) => {
        // console.log(element);
        // for (let key in element) {
        // if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
        return res.redirect(`/wallStreet`);

        break;
      case 'tesla':
        // teslaSearch.data.forEach((element) => {
        // console.log(element);
        // for (let key in element) {
        // if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
        return res.redirect(`/tesla`);

        break;
      case 'bitcoin':
        // bitcoinSearch.data.forEach((element) => {
        // console.log(element);
        // for (let key in element) {
        // if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
        return res.redirect(`/tesla`);

        break;
      case 'sources':
        // sourcesSearch.data.forEach((element) => {
        // console.log(element);
        // for (let key in element) {
        // if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
        return res.redirect(`/sources`);

        break;
      case 'us':
        // case inputData.name.toLowerCase() === 'us':
        console.log('us news ---->', usNewsSearch.data);
        // usNewsSearch.data.forEach((element) => {
        // for (let key in element) {
        // if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
        return res.redirect(`/us`);

        break;

      case 'bbc':
        // bbcNewsSearch.data.forEach((element) => {
        // console.log(element);
        // for (let key in element) {
        // if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
        return res.redirect(`/bbc`);
        break;
      case 'trump':
        // trumpSearch.data.forEach((element) => {
        console.log('trump ---->', trumpSearch.data);
        // for (let key in element) {
        // if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
        return res.redirect(`/trump`);
        break;
    }
    console.log('result ---------->', req.body.category);
    if (result.length < 1) {
      res.render('search', {
        elements: result,
        categoryName: inputData.name || '',
        fieldName: req.body.category || '',
        itemName: req.body.item || ''
      });
    } else {
      res.render('search', {
        elements: result,
        categoryName: inputData.name || '',
        fieldName: req.body.category || '',
        itemName: req.body.item || ''
      });
      return res.redirect(`/article?name=${inputData.name}&category=${req.body.category}`);
    }
  } catch (error) {
    res.json({ message: 'Data not found. Please try again later.' });
  }
});
*/
// ===============================================================================//
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`📖 You're reading the latest news port ${PORT} 📖`);
});

module.exports = {
  server,
  app,
  PORT,
  axios
};