const { expect } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLs = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'quinnb' },
  "9sm5xK": { longURL: "http://www.google.com", userID: 'quinnb' },
  "b2xVn3": { longURL: "http://www.youtube.com", userID: 'mikexv' },
  "9sm5x3": { longURL: "http://www.twitch.tv", userID: 'mikexv' },
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    expect(user).to.equal(expectedOutput);
  });
  it('should return undefined if given an invalid email', function() {
    const user = getUserByEmail("not_an_email@example.com", testUsers);
    expect(user).to.be.undefined;
  });
});

describe('urlsForUser', () => {
  it('should return a database containing only the urls for the given user', () => {
    const quinnURLs = urlsForUser('quinnb', testURLs);
    const expectedURLs = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'quinnb' },
      "9sm5xK": { longURL: "http://www.google.com", userID: 'quinnb' },
    };
    expect(quinnURLs).to.deep.equal(expectedURLs);
  });
  it('should return an empty object if given an invalid user', () => {
    const quinnURLs = urlsForUser('dougls', testURLs);
    const expectedURLs = {};
    expect(quinnURLs).to.deep.equal(expectedURLs);
  });
});
