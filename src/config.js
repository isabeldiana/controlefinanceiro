require("dotenv").config();
module.exports = {
  jwt: {
    senhaJwt: process.env.PASS_JWT,
    options: {
      expiresIn: "1d",
    },
  },
};
