const pool = require("../conexao");
const config = require("../config");
const jwt = require("jsonwebtoken");

const verificarUsuarioLogado = async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (!authorization) {
      return res.status(401).json({ mensagem: "Não autorizado" });
    }

    const token = authorization.split(" ")[1];
    const { id } = jwt.verify(token, config.jwt.senhaJwt);

    const usuarioId = await pool.query("select * from usuarios where id = $1", [
      id,
    ]);
    if (usuarioId.rowCount < 1) {
      res.status(401).json({ mensagem: "Não autorizado" });
    }

    req.usuario = usuarioId.rows[0];

    next();
  } catch (error) {
    res.status(401).json({ mensagem: "Não autorizado" });
  }
};

module.exports = verificarUsuarioLogado;
