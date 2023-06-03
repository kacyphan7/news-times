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

/* psuedocode 
app.get('/profile/saved', function (req, res) {

  if (profile === saved list)
})

// list to redirect 
// list to view each individual link ejs out and for loop 

*/

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

/* 
// post search route form ============= POST SEARCH ROUTE NEED TO GET SPECIFIC ARTICLE // 
const validCategories = ['name', 'category', 'language', 'country'];

const excludes = ['ABC News'];

app.post('/search', function (req, res) {
  // Create a new object called searchData
  const searchData = {};

  // Add the following properties to the searchData object
  searchData.name = req.body.name;
  searchData.category = req.body.category;
  searchData.language = req.body.language;
  searchData.country = req.body.country;

  // Check if the category is valid
  if (!validCategories.includes(searchData.category)) {
    searchData.category = null;
  }

  // Set the searchTerm property
  searchData.searchTerm = req.body.searchTerm;

  // Set the exclude property
  searchData.exclude = excludes;

  // Make a request to the News API to get the top headlines for the specified category
  axios.get('https://newsapi.org/v2/top-headlines/sources?apiKey=' + apiKey, {
    params: searchData,
  })
    .then(function (response) {
      if (response.status === 200) {
        // Redirect the browser to the /sources route with the searchData object as a query string
        res.redirect(`/sources?${JSON.stringify(searchData)}`);
      } else {
        res.json({ message: 'Data not found. Please try again later.' });
      }
    })
    .catch(function (error) {
      res.json({ message: 'Error occurred. Please try again later.' });
    });
});
*/

/* app.get('/article', (req, res) => {
  const { name, category } = req.query;
  res.render('article', { name, category });
}); */

// language and country not require 
app.post('/search', async function (req, res) {
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
    switch (req.body.name) {
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
        businessSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key] === null) {
              // result.push(element);
              continue;
            } else if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
      case 'techCrunch':
        techCrunchSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
      case 'wallStreet':
        wallStreetSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
      case 'tesla':
        teslaSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
      case 'bitcoin':
        bitcoinSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
      case 'sources':
        sourcesSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
      case 'us':
        usNewsSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
      case 'bbc':
        bbcNewsSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
      case 'trump':
        trumpSearch.data.forEach((element) => {
          console.log(element);
          for (let key in element) {
            if (key === req.body.category && element[key].toString().toLowerCase() === req.body.item.toLowerCase()) {
              result.push(element);
            }
          }
        });
        break;
    }
    console.log('result ---------->', req.body.field);
    if (result.length < 1) {
      res.render('search', {
        elements: result,
        categoryName: req.body.name || '',
        fieldName: req.body.category || '',
        itemName: req.body.item || ''
      });
    } else {
      res.render('search', {
        elements: result,
        categoryName: req.body.name || '',
        fieldName: req.body.category || '',
        itemName: req.body.item || ''
      });
      return res.redirect(`/article?name=${req.body.name}&category=${req.body.category}`);
    }
  } catch (error) {
    res.json({ message: 'Data not found. Please try again later.' });
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