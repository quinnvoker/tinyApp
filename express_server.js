const express = require("express");
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const generateRandomString = require('./randomString');
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

//returns key of the user registered with a given email address, null if not found
const findUserByEmail = (email, database) => {
  const foundKeys = Object.keys(database)
    .filter((key) => database[key].email === email);
  return foundKeys.length > 0 ? foundKeys[0] : null;
};

const urlsForUser = (id) => {
  return Object.keys(urlDatabase)
    .filter(key => urlDatabase[key].userID === id)
    .reduce((result, currentKey) => {
      result[currentKey] = urlDatabase[currentKey];
      return result;
    }, {});
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  let templateVars = { user, urls: urlsForUser(userID) };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect('/login');
  } else {
    let templateVars = { user };
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const isOwner = urlDatabase[shortURL].userID === userID;
  let templateVars = { user, shortURL, longURL, isOwner };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    res.statusCode = 404;
    res.send(`404: short url ${shortURL} was not found on the server!`);
  }
});

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  let templateVars = { user };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  let templateVars = { user };
  res.render('login', templateVars);
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
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    if (urlDatabase[shortURL].userID === req.session.user_id) {
      delete urlDatabase[shortURL];
      res.redirect(`/urls`);
    } else {
      res.statusCode = 403;
      res.send('403: You do not have permission to delete this TinyURL');
    }
  } else {
    res.statusCode = 404;
    res.send(`404: TinyURL '${shortURL}' was not found on the server!`);
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL]) {
    console.log(req.session.user_id);
    if (urlDatabase[shortURL].userID === req.session.user_id) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect(`/urls`);
    } else {
      res.statusCode = 403;
      res.send('403: You do not have permission to edit this TinyURL');
    }
  } else {
    res.statusCode = 404;
    res.send(`404: TinyURL '${shortURL}' was not found on the server!`);
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = users[findUserByEmail(email, users)];
  if (!user) {
    res.statusCode = 403;
    res.send('403: no user exists with email address entered');
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.statusCode = 403;
    res.send('403: incorrect password');
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
    res.statusCode = 400;
    res.send('400: invalid email or password');
  } else if (findUserByEmail(email, users)) {
    res.statusCode = 400;
    res.send('400: email address already in use!');
  } else {
    users[id] = { id, email, password: hashedPass };
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
