module.exports = {
  pool: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "25262829",
    database: "dindin",
  },
  jwt: {
    senhaJwt: "senha_secreta",
    options: {
      expiresIn: "1d",
    },
  },
};
