const Hubspot = require("hubspot");

module.exports = key => {
  return new Hubspot({ apiKey: key });
};
