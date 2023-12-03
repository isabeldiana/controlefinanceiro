const pg = require("pg");
const config = require("./config");

const pool = new pg.Pool(config.pool);

const types = pg.types;

types.setTypeParser(1114, function (stringValue) {
  return stringValue;
});

module.exports = { pool };
