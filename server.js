require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const axios = require('axios');
const app = express();
const ejsLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const methodOverride = require('method-override');
const path = require('path');
const mime = require('mime');
const profileRouter = require('./controllers/profile');
// const fs = require('fs');
// const usersDataPath = 'data/users.json';
// const articlesDataPath = 'data/articles.json';

// environment variables 
const SECRET_SESSION = process.env.SECRET_SESSION;
const apiKey = process.env.NEWS_API_KEY;

// console.log('>>>>>>>>', SECRET_SESSION);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.use(require('morgan')('dev'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
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

app.use(express.static('public', {
  setHeaders: (res, path) => {
    res.setHeader('Content-Type', mime.getType(path));
  }
}));

app.use('/profile', profileRouter);

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/auth', require('./controllers/auth'));
app.use('/savedArticles', require('./controllers/savedArticles'));

// Add this above /auth controllers
/* app.get('/profile', isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get();
  res.render('profile', { id, name, email });
}); */

/* app.post('/profile/articles', isLoggedIn, async (req, res) => { // <- fail to save articles 
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
}); */

// Add article to saved list
/* app.post('/save-article', isLoggedIn, (req, res) => {
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
}); */

// Remove article from saved list
/* app.post('/delete-article', isLoggedIn, (req, res) => {
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
}); */

/* app.put('/articles/save', isLoggedIn, (req, res) => {
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
}); */

/* app.put('/articles/:author', isLoggedIn, (req, res) => {
  try {
    const author = req.params.author;
    const { title, description, url, source } = req.body;

    // Update the article in your data source based on the author

    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update the article' });
  }
}); */

/* app.put('/articles/:articleAuthor/read', isLoggedIn, (req, res) => {
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
}); */

/* app.delete('/articles/:articleAuthor/unsave', isLoggedIn, (req, res) => {
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
} */

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
/* app.get('/us/search', function (req, res) {
  return res.render('us/search');
}); */

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
/* app.get('/bbc/search', function (req, res) {
  return res.render('bbc/search');
});*/

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

// search by keyword instead of title  2023-06-02 // switch case && for each loop to look up item
/* app.post('/bbc', function (req, res) {
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
}); */

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