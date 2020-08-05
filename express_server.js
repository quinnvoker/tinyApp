const express = require("express");
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const { getUserByEmail, urlsForUser, generateRandomString, hitURL, getTotalHits, getUniqueHits, getAllHits } = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['is this a secret key?? lets find out together'],
  maxAge: 24 * 60 * 60 * 1000, //24 hour expiry
}));
app.use(express.static('public'));
app.use(methodOverride('_method'));

const users = {};

const urlDatabase = {
  // default entries for testing
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: 'quinnb', hits: {} },
  "9sm5xK": { longURL: "http://www.google.com", userId: 'quinnb', hits: {} },
};

// send client a page containing a given error message and status code
const sendError = (request, response, message, code = 200) => {
  response.statusCode = code;
  const user = users[request.session.userId];
  const errorMsg = `${code}: ${message}`;
  const templateVars = { user, errorMsg };
  response.render('error', templateVars);
};

app.get("/", (req, res) => {
  const user = users[req.session.userId];
  if (!user) {
    res.redirect('/login');
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { user, urls: urlsForUser(userId, urlDatabase) };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.session.userId];
  if (!user) {
    res.redirect('/login');
  } else {
    const templateVars = { user };
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    sendError(req, res, `TinyURL '${shortURL}' not found in database!`, 404);
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    const isOwner = urlDatabase[shortURL].userId === userId;
    const templateVars = { user, shortURL, longURL, isOwner };
    res.render("urls_show", templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    if (!req.session.visitorId) {
      req.session.visitorId = generateRandomString(6);
    }
    hitURL(shortURL, req.session.visitorId, urlDatabase);
    console.log(urlDatabase[shortURL].hits);
    console.log('Total Hits:', getTotalHits(shortURL, urlDatabase));
    console.log('Unique Hits:', getUniqueHits(shortURL, urlDatabase));
    console.log(getAllHits(shortURL, urlDatabase));
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    sendError(req, res, `TinyURL '${shortURL}' not found in database!`, 404);
  }
});

app.get('/register', (req, res) => {
  const user = users[req.session.userId];
  if (!user) {
    const templateVars = { user };
    res.render('register', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const user = users[req.session.userId];
  if (!user) {
    const templateVars = { user };
    res.render('login', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  const userId = req.session.userId;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userId, hits: {} };
  console.log(`Added ${longURL} to database with shortURL ${shortURL} with userId '${userId}'`);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = users[getUserByEmail(email, users)];
  if (!user) {
    sendError(req, res, 'Given email address not associated with any registered user', 403);
  } else if (!bcrypt.compareSync(password, user.password)) {
    sendError(req, res, 'Incorrect password', 403);
  } else {
    req.session.userId = user.id;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPass = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    sendError(req, res, 'Invalid email or password', 400);
  } else if (getUserByEmail(email, users)) {
    sendError(req, res, 'Email address already registered!', 400);
  } else {
    users[id] = { id, email, password: hashedPass };
    req.session.userId = id;
    res.redirect('/urls');
  }
});

app.put('/urls/:shortURL', (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL]) {
    if (urlDatabase[shortURL].userId === userId) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect(`/urls`);
    } else {
      sendError(req, res, 'You do not have permission to edit this TinyURL', 403);
    }
  } else {
    sendError(req, res, `TinyURL '${shortURL}' was not found on the server!`, 404);
  }
});

app.delete('/urls/:shortURL', (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    if (urlDatabase[shortURL].userId === userId) {
      delete urlDatabase[shortURL];
      res.redirect(`/urls`);
    } else {
      sendError(req, res, 'You do not have permission to delete this TinyURL', 403);
    }
  } else {
    sendError(req, res, `TinyURL '${shortURL}' was not found on the server!`, 404);
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
