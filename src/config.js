require("dotenv").config();
module.exports = {
  pool: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    senhaJwt: process.env.PASS_JWT,
    options: {
      expiresIn: "1d",
    },
  },
};
