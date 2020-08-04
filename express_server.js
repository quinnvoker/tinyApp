const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const generateRandomString = require('./randomString');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('public'));

const users = {};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'quinnb' },
  "9sm5xK": { longURL: "http://www.google.com", userID: 'quinnb' },
  "b2xVn3": { longURL: "http://www.youtube.com", userID: 'mikex' },
  "9sm5x3": { longURL: "http://www.twitch.tv", userID: 'mikex' },
};

//returns key of the user registered with a given email address, null if not found
const findUserByEmail = (email) => {
  const foundKeys = Object.keys(users)
    .filter((key) => users[key].email === email);
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
  const user = users[req.cookies.user_id];
  let templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    res.redirect('/login');
  } else {
    let templateVars = { user };
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies.user_id];
  const shortURL = req.params.shortURL;
  let templateVars = { user, shortURL, longURL: urlDatabase[shortURL].longURL };
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
  const user = users[req.cookies.user_id];
  let templateVars = { user };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.cookies.user_id];
  let templateVars = { user };
  res.render('login', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  const userID = req.cookies.user_id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID };
  console.log(`Added ${longURL} to database with shortURL ${shortURL} with userID '${userID}'`);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.statusCode = 404;
    res.send(`404: short url ${shortURL} was not found on the server!`);
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls`);
  } else {
    res.statusCode = 404;
    res.send(`404: short url ${shortURL} was not found on the server!`);
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = users[findUserByEmail(email)];
  if (!user) {
    res.statusCode = 403;
    res.send('403: no user exists with email address entered');
  } else if (password !== user.password) {
    res.statusCode = 403;
    res.send('403: incorrect password');
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.statusCode = 400;
    res.send('400: invalid email or password');
  } else if (findUserByEmail(email)) {
    res.statusCode = 400;
    res.send('400: email address already in use!');
  } else {
    users[id] = { id, email, password };
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
