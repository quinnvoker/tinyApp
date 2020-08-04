const generateRandomString = (length) => {
  const allValidChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from('0'.repeat(length)) // array initialisation for given length idea from https://stackoverflow.com/questions/4852017/how-to-initialize-an-arrays-length-in-javascript
    .map(() => allValidChars[Math.floor(Math.random() * allValidChars.length)])
    .join('');
};

module.exports = generateRandomString;