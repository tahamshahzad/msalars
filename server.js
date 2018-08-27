const fs = require("fs");
const https = require("https");

const options = {
  key: fs.readFileSync("./webhook.key"),
  cert: fs.readFileSync("./webhook.crt")
};

const app = require("./app");

const server = https.createServer(options, app);

server.listen(3000, () => {
  console.log(`server is started on port : ${3000}`);
});
