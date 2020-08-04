const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const allValidChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return '000000'.split('')
    .map(() => allValidChars[Math.floor(Math.random() * allValidChars.length)])
    .join('');
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const username = req.cookies.username;
  let templateVars = { username, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(`Added ${req.body.longURL} to database with shortURL ${shortURL}`);
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.cookies.username };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { username: req.cookies.username, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
