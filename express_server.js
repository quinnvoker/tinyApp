const express = require("express");
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');
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

const users = {};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'quinnb' },
  "9sm5xK": { longURL: "http://www.google.com", userID: 'quinnb' },
  "b2xVn3": { longURL: "http://www.youtube.com", userID: 'mikexv' },
  "9sm5x3": { longURL: "http://www.twitch.tv", userID: 'mikexv' },
};

const sendError = (req, res, message, code = 200) => {
  res.statusCode = code;
  const userID = req.session.user_id;
  const user = users[userID];
  const errorMsg = `${code}: ${message}`;
  const templateVars = { user, errorMsg };
  res.render('error', templateVars);
};

app.get("/", (req, res) => {
  const user = users[req.session.user_id];
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
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user, urls: urlsForUser(userID, urlDatabase) };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect('/login');
  } else {
    const templateVars = { user };
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    sendError(req, res, `TinyURL '${shortURL}' not found in database!`, 404);
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    const isOwner = urlDatabase[shortURL].userID === userID;
    const templateVars = { user, shortURL, longURL, isOwner };
    res.render("urls_show", templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    sendError(req, res, `TinyURL '${shortURL}' not found in database!`, 404);
  }
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    const templateVars = { user };
    res.render('register', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    const templateVars = { user };
    res.render('login', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID };
  console.log(`Added ${longURL} to database with shortURL ${shortURL} with userID '${userID}'`);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    if (urlDatabase[shortURL].userID === userID) {
      delete urlDatabase[shortURL];
      res.redirect(`/urls`);
    } else {
      sendError(req, res, 'You do not have permission to delete this TinyURL', 403);
    }
  } else {
    sendError(req, res, `TinyURL '${shortURL}' was not found on the server!`, 404);
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL]) {
    if (urlDatabase[shortURL].userID === userID) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect(`/urls`);
    } else {
      sendError(req, res, 'You do not have permission to edit this TinyURL', 403);
    }
  } else {
    sendError(req, res, `TinyURL '${shortURL}' was not found on the server!`, 404);
  }
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
    req.session.user_id = user.id;
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
    // res.statusCode = 400;
    // const templateVars = { user: null, errorMsg: `400: invalid email or password` };
    // res.render('error', templateVars);
  } else if (getUserByEmail(email, users)) {
    sendError(req, res, 'Email address already registered!', 400);
    // res.statusCode = 400;
    // const templateVars = { user: null, errorMsg: `400: email address already in use!` };
    // res.render('error', templateVars);
  } else {
    users[id] = { id, email, password: hashedPass };
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
