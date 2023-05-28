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

// All articles mentioning Apple 
app.get('/apple', function (req, res) {
  axios.get('https://newsapi.org/v2/everything?q=apple&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('apple', { apple: response.data });
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

// Top business headlines in the US right now
app.get('/business', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('business', { business: response.data });
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

// Top headlines from TechCrunch right now
app.get('/techCrunch', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('techCrunch', { techCrunch: response.data });
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

// All articles published by the Wall Street Journal in the last 6 months, sorted by recent first
app.get('/wallStreet', function (req, res) {
  axios.get('https://newsapi.org/v2/everything?domains=wsj.com&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('wallStreet', { wallStreet: response.data });
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

// All articles about Tesla from the last month, sorted by recent first
app.get('/tesla', function (req, res) {
  axios.get('https://newsapi.org/v2/everything?q=tesla&from=2023-04-28&sortBy=publishedAt&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('tesla', { tesla: response.data });
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

// All articles about Bitcoin
app.get('/bitcoin', function (req, res) {
  axios.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('bitcoin', { bitcoin: response.data });
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

// All sources
app.get('/sources', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines/sources?&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('sources', { sources: response.data });
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

// Top headlines in the US
app.get('/us', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('us', { us: response.data });
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

// Top headlines from BBC News
app.get('/bbc', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('bbc', { bbc: response.data });
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

// Top headlines about Trump
app.get('/trump', function (req, res) {
  axios.get('https://newsapi.org/v2/top-headlines?q=trump&apiKey=' + apiKey)
    .then(function (response) {
      // handle success
      if (response.status === 200) {
        res.render('trump', { trump: response.data });
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

// Search page
/* app.get('/search', (req, res) => {
  const news = newsAPI.getEverything({
    q: req.query.q,
  });

  res.render('search.ejs', { news });
}); */


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
