const request = require("request");
const express = require("express");

const subdomain = "uusio";
const apiKey = "269a2a12ceb913d";
const hasKey = "c18976e60a72ab9a03ec4856dcfca693";

const bodyParser = require("body-parser");
const MySQL = require("./MySQL");
const hubspot = require("./Hubspot");

// helper methods for api
const app = express();
const hubspotContactPayload = require("./helper-functions/hubspotContactPayload");
const cronHandler = require("./helper-functions/runCron");

app.use(bodyParser.json());

app.post("/start-service", async (req, res) => {
  const { body } = req;
  console.log(body);
  const { interval, host, user, password, database, databaseLastID } = body;
  console.log("body", body);
  const response = larsFlow.start({
    interval,
    host,
    user,
    password,
    database,
    databaseLastID
  });
  res.json(response);
});

app.get("/stop-service", function(req, res) {
  larsFlow.stop();
  res.json("stopped the service");
});

module.exports = app;

function sendlaneUrlGenerator({ params, method }) {
  const queryString = Object.keys(params).reduce(
    (string, key) => string.concat(`&${key}=${params[key]}`),
    ""
  );

  return `https://${subdomain}.sendlane.com/api/v1/${method}?api=${apiKey}&hash=${hasKey}${queryString}`;
}

const larsFlow = {
  status: "stopped",
  lastRecordId: 1,
  intervalRef: null,
  hubspotInstance: null,
  mysqlConnection: null,
  sendlaneListId: null,
  sendNewRequest: true,

  stop() {
    cronHandler.clearCron(this.intervalRef, status => {
      if (status === "stopped") {
        console.log("stopped the flow");
        this.reset();
      }
    });
  },

  reset() {
    console.log("resetting the flow");
    this.status = "stopped";
    this.lastRecordId = 1;
    this.intervalRef = null;
    this.hubspotInstance = null;
    this.mysqlConnection = null;
    this.sendlaneListId = null;
    this.sendNewRequest = true;
  },

  start({ interval, host, user, password, database, databaseLastID }) {
    this.lastRecordId = databaseLastID;

    if (this.status === "running") {
      this.stop();
    }

    this.status = "running";

    console.log("started the flow");

    this.hubspotInstance = hubspot("0d28007a-ff4c-41ed-ac5a-050b8c0ded05");

    this.mysqlConnection = new MySQL({
      host,
      user,
      password,
      database
    });

    this.intervalRef = cronHandler.runCron(interval, this.fetchData.bind(this));

    return "cron started";
  },

  fetchData() {
    if (this.sendNewRequest) {
      this.sendNewRequest = false;

      this.mysqlConnection.query(
        "SELECT * FROM users where id > " + this.lastRecordId,
        (error, results, fields) => {
          if (!error && results) {
            this.handleResults(results);
          } else {
            cronHandler.clearCron(this.intervalRef, status => {
              if (status === "stopped") {
                console.log("stopped cuz of error");
              }
            });
          }
        }
      );
    }
  },

  addUserToHubSpot(record) {
    const contactPayload = hubspotContactPayload(record);

    return this.hubspotInstance.contacts
      .createOrUpdate(record.email, contactPayload)
      .then(response => {
        return new Promise((resolve, reject) => {
          resolve(response);
        });
      })
      .catch(error => {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      });
  },

  handleResults(results) {
    console.log(results);
    this.setLastRecordId(results);
    if (results.length > 0) {
      results.map((record, index) => {
        // hubspot middleware
        this.addUserToHubSpot(record)
          .then(response => {
            console.log("hubspot response", response);
            //send lane api
            request.post(
              sendlaneUrlGenerator({
                params: {
                  first_name: record.firstName,
                  last_name: record.lastName,
                  email: record.email,
                  list_id: 1
                },
                method: "list-subscriber-add"
              }),
              (err, response) => {
                if (!err) {
                  console.log("response.body", response.body);
                  if (index === results.length - 1) {
                    this.sendNewRequest = true;
                  }
                } else {
                  console.log("err", err);
                  if (index === results.length - 1) {
                    this.sendNewRequest = true;
                  }
                }
              }
            );
          })
          .catch(error => {
            console.log(error.message);
            if (index === results.length - 1) {
              this.sendNewRequest = true;
            }
          });
      });
    } else {
      this.sendNewRequest = true;
    }
  },

  setLastRecordId(results) {
    if (results.length > 0) {
      this.lastRecordId = results[results.length - 1].id;
    }
  }
};
