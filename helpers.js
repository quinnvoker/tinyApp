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

module.exports = { getUserByEmail, urlsForUser, generateRandomString };