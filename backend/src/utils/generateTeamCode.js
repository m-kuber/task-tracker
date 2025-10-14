const { randomBytes } = require('crypto');

function generateTeamCode(len = 8) {
  // returns uppercase alphanumeric
  return randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len).toUpperCase();
}

module.exports = generateTeamCode;
