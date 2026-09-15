const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },              // payload — the data embedded in the token
    process.env.JWT_SECRET,      // secret key used to create the signature
    { expiresIn: '1h' }         // token becomes invalid after 1 hour
  );
};
module.exports = generateToken;
