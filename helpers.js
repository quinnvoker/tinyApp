const getUserByEmail = (email, database) => {
  const foundKeys = Object.keys(database)
    .filter((key) => database[key].email === email);
  return foundKeys.length > 0 ? foundKeys[0] : undefined;
};

const urlsForUser = (id, database) => {
  return Object.keys(database)
    .filter(key => database[key].userID === id)
    .reduce((result, currentKey) => {
      result[currentKey] = database[currentKey];
      return result;
    }, {});
};

const generateRandomString = (length) => {
  const allValidChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from('0'.repeat(length)) // array initialisation for given length idea from https://stackoverflow.com/questions/4852017/how-to-initialize-an-arrays-length-in-javascript
    .map(() => allValidChars[Math.floor(Math.random() * allValidChars.length)])
    .join('');
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };