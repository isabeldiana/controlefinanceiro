const pool = require("../conexao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const senhaCriptografada = async (req, res) => {
  const { senha } = req.body;

  const criptografia = await bcrypt.hash(senha, 10);

  return criptografia;
};

const verificadorCamposPreenchidosRegistroUsuario = (req, res) => {
  const { nome, email, senha } = req.body;

  if (
    !nome ||
    !email ||
    !senha ||
    nome.trim() === "" ||
    email.trim() === "" ||
    senha.trim() === ""
  ) {
    return false;
  }

  return true;
};

const verificadorCamposPreenchidosRegistroTransacao = (req, res) => {
  const { tipo, descricao, valor, data, categoria_id } = req.body;

  if (
    !tipo ||
    !descricao ||
    !valor ||
    !data ||
    !categoria_id ||
    tipo.trim() === "" ||
    descricao.trim() === "" ||
    data.trim() === ""
  ) {
    return false;
  }

  return true;
};

const verificadorCategoria = async (req, res) => {
  const { categoria_id } = req.body;

  const verificarCategoria = await pool.query(
    "select * from categorias where id = $1",
    [categoria_id]
  );
  if (verificarCategoria.rowCount < 1) {
    return false;
  }

  return true;
};

const verificadorTipo = (req, res) => {
  const { tipo } = req.body;

  if (tipo !== "entrada" && tipo !== "saida") {
    return false;
  }

  return true;
};

const idUsuarioLogado = (req, res) => {
  const { authorization } = req.headers;

  const token = authorization.split(" ")[1];
  const id = jwt.decode(token).id;

  return id;
};

const verificadorTransacaoDoUsuarioLogado = async (req, res) => {
  const { id } = req.params;

  const transacao = await pool.query(
    "select * from transacoes where usuario_id = $1 and id = $2",
    [idUsuarioLogado(req, res), id]
  );
  if (transacao.rowCount < 1) {
    return false;
  }

  return true;
};

module.exports = {
  senhaCriptografada,
  verificadorCamposPreenchidosRegistroUsuario,
  verificadorCamposPreenchidosRegistroTransacao,
  verificadorCategoria,
  verificadorTipo,
  idUsuarioLogado,
  verificadorTransacaoDoUsuarioLogado,
};
