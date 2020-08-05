// returns id string of the user in the database with given email; undefined if no matching user found
const getUserByEmail = (email, database) => {
  const foundKeys = Object.keys(database)
    .filter((key) => database[key].email === email);
  return foundKeys.length > 0 ? foundKeys[0] : undefined;
};

// returns a copy of the database, filtered to only contain entry's belonging to the given userId
const urlsForUser = (id, database) => {
  return Object.keys(database)
    .filter(key => database[key].userId === id)
    .reduce((result, currentKey) => {
      result[currentKey] = database[currentKey];
      return result;
    }, {});
};

// generates a string of random characters of a given length
const generateRandomString = (length) => {
  const allValidChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from('0'.repeat(length)) // array initialisation for given length idea from https://stackoverflow.com/questions/4852017/how-to-initialize-an-arrays-length-in-javascript
    .map(() => allValidChars[Math.floor(Math.random() * allValidChars.length)])
    .join('');
};

// log a visit to the given url entry in the database
const hitURL = (url, visitorId, database) => {
  const urlEntry = database[url];
  if (!urlEntry) {
    return;
  }
  if (!urlEntry.hits[visitorId]) {
    urlEntry.hits[visitorId] = [];
  }
  urlEntry.hits[visitorId].push(Date.now());
};

// returns how many times a given url has been visited
const getTotalHits = (url, database) => {
  const urlHits = database[url].hits;
  return Object.keys(urlHits)
    .reduce((total, visitor) => total + urlHits[visitor].length, 0);
};

// returns how many unique visitors have visited the given url
const getUniqueHits = (url, database) => {
  const urlHits = database[url].hits;
  return Object.keys(urlHits).length;
};

// returns a sorted array of visit objects (visitor: timestamp) for a given url
const getAllHits = (url, database) => {
  const urlHits = database[url].hits;
  return Object.keys(urlHits)
    .reduce((list, visitor) => {
      // turn each visitor's hit array into an array of visitorId: timestamp pairs
      const visits = urlHits[visitor]
        .reduce((visits, current) => visits.concat({ [visitor]: current }), []);
      return list.concat(visits);
    }, [])
    // sort combined array by timestamp (descending)
    .sort((a, b) => {
      const valueA = Object.values(a)[0];
      const valueB = Object.values(b)[0];
      if (valueA === valueB) {
        return 0;
      }
      return valueA > valueB ? -1 : 1;
    });
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString, hitURL, getTotalHits, getUniqueHits, getAllHits };