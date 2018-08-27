const mysql = require("mysql");

module.exports = class MySQL {
  constructor({ host, user, password, database }) {
    this.connection = this.createConnection(host, user, password, database);
  }

  createConnection(host, user, password, database) {
    return mysql.createConnection({
      host,
      user,
      password,
      database
    });
  }

  query(q, cb) {
    this.connection.query(q, (error, results, fields) => {
      // this.closeConnection();
      cb(error, results, fields);
    });
  }

  closeConnection() {
    this.connection.end();
  }
};
