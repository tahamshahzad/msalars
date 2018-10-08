const request = require("request");

class Sendlane {
  constructor({ apiKey, hashKey, subdomain, version }) {
    this.init({ apiKey, hashKey, subdomain, version });
  }

  init({ apiKey, hashKey, subdomain, version }) {
    this.apiEndPoint = `https://${subdomain}.sendlane.com/api/${version}/`;
    this.apiKey = apiKey;
    this.hashKey = hashKey;
  }

  call({ endpoint, params, ...rest }) {}
  callGenerator() {
    
  }
  request() {}
}

function sendlaneUrlGenerator({ params, method }) {
  const query = Object.keys(params).reduce(
    (string, key) => string.concat(`&${key}=${params[key]}`),
    ""
  );
  return `https://${subdomain}.sendlane.com/api/${version}/${method}?api=${apiKey}&hash=${hasKey}${queryString}`;
}
