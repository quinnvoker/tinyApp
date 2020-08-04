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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let templateVars = { user };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies.user_id];
  let templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL]);
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

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  console.log(`Added ${req.body.longURL} to database with shortURL ${shortURL}`);
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
  let name = req.body.username;
  res.cookie('username', name);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.statusCode = 400;
    res.send('400: invalid email or password');
  } else {
    users[id] = { id, email, password };
    res.cookie('user_id', id);
    console.log(JSON.stringify(users, 2));
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
