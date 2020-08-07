const { expect } = require('chai');

const { getUserByEmail, urlsForUser, hitURL, getTotalHits, getUniqueHits, getAllHits } = require('../helpers/helpers.js');

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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: 'quinnb', hits: { 'xxxxxx': [123, 124, 125], 'yyyyyy': [111, 126, 134] } },
  "9sm5xK": { longURL: "http://www.google.com", userId: 'quinnb', hits: {} },
  "b2xVn3": { longURL: "http://www.youtube.com", userId: 'mikexv', hits: {} },
  "9sm5x3": { longURL: "http://www.twitch.tv", userId: 'mikexv', hits: {} },
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
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: 'quinnb', hits: { 'xxxxxx': [123, 124, 125], 'yyyyyy': [111, 126, 134] } },
      "9sm5xK": { longURL: "http://www.google.com", userId: 'quinnb', hits: {} },
    };
    expect(quinnURLs).to.deep.equal(expectedURLs);
  });
  it('should return an empty object if given an invalid user', () => {
    const quinnURLs = urlsForUser('dougls', testURLs);
    const expectedURLs = {};
    expect(quinnURLs).to.deep.equal(expectedURLs);
  });
});

describe('hitURL', () => {
  it('should add a new hit to the given url on each call', () => {
    const url = '9sm5xK';
    const visitorId = 'testID';
    hitURL(url, visitorId, testURLs);
    hitURL(url, visitorId, testURLs);
    expect(testURLs[url].hits[visitorId].length).to.equal(2);
  });
  it('should return undefined if given url is invalid', () => {
    const url = 'notReal';
    const visitorId = 'testID';
    expect(hitURL(url, visitorId, testURLs)).to.be.undefined;
  });
});

describe('getTotalHits', () => {
  it('should return the number of hits a link has received from all visitors', () => {
    const url = 'b2xVn2';
    // hits for this url: { 'xxxxxx': [123, 124, 125], 'yyyyyy': [111, 126, 134] }
    expect(getTotalHits(url, testURLs)).to.equal(6);
  });
  it('should return undefined if given url is invalid', () => {
    const url = 'notReal';
    expect(getTotalHits(url, testURLs)).to.be.undefined;
  });
});

describe('getUniqueHits', () => {
  it('should return the number of visitor ids that have visited a link', () => {
    const url = 'b2xVn2';
    // hits for this url: { 'xxxxxx': [123, 124, 125], 'yyyyyy': [111, 126, 134] }
    expect(getUniqueHits(url, testURLs)).to.equal(2);
  });
  it('should return undefined if given url is invalid', () => {
    const url = 'notReal';
    expect(getUniqueHits(url, testURLs)).to.be.undefined;
  });
});

describe('getAllHits', () => {
  it('should return a sorted array containing all vistorId: timestamp pairs for a link', () => {
    const url = 'b2xVn2';
    // hits for this url: { 'xxxxxx': [123, 124, 125], 'yyyyyy': [111, 126, 134] }
    const expectedArray = [
      { yyyyyy: 134 },
      { yyyyyy: 126 },
      { xxxxxx: 125 },
      { xxxxxx: 124 },
      { xxxxxx: 123 },
      { yyyyyy: 111 },
    ];
    expect(getAllHits(url, testURLs)).to.deep.equal(expectedArray);
  });
  it('should return undefined if given url is invalid', () => {
    const url = 'notReal';
    expect(getAllHits(url, testURLs)).to.be.undefined;
  });
});