const { pool } = require("../conexao");
const config = require("../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  senhaCriptografada,
  verificadorCamposPreenchidosRegistroUsuario,
  idUsuarioLogado,
} = require("../intermediario/filtros");

const cadastrarUsuario = async (req, res) => {
  const { nome, email } = req.body;

  try {
    if (!verificadorCamposPreenchidosRegistroUsuario(req, res)) {
      return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    const validarEmail = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );
    if (validarEmail.rowCount > 0) {
      return res.status(400).json({
        mensagem: "Já existe usuário cadastrado com o e-mail informado.",
      });
    }

    const novoUsuario = await pool.query(
      "insert into usuarios(nome, email, senha) values ($1,$2,$3) returning *",
      [nome, email, await senhaCriptografada(req, res)]
    );

    const resultado = {
      id: novoUsuario.rows[0].id,
      nome: novoUsuario.rows[0].nome,
      email: novoUsuario.rows[0].email,
    };

    return res.status(201).json(resultado);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    const usuario = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );
    if (usuario.rowCount < 1) {
      return res
        .status(400)
        .json({ mensagem: "E-mail ou senha inválidos(s)." });
    }

    const validarSenha = await bcrypt.compare(senha, usuario.rows[0].senha);
    if (!validarSenha) {
      return res
        .status(400)
        .json({ mensagem: "E-mail ou senha inválidos(s)." });
    }

    const token = jwt.sign(
      { id: usuario.rows[0].id },
      config.jwt.senhaJwt,
      config.jwt.options
    );

    const { senha: _, ...usuarioLogado } = usuario.rows[0];

    return res.json({ usuarioLogado, token });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const detalharUsuario = async (req, res) => {
  try {
    const { senha: _, ...detalhesUsuario } = req.usuario;

    return res.json(detalhesUsuario);
  } catch (error) {
    return res.status(401).json({
      mensagem:
        "Para acessar este recurso um token de autenticação válido deve ser enviado.",
    });
  }
};

const atualizarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    if (!verificadorCamposPreenchidosRegistroUsuario(req, res)) {
      return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    const validarEmail = await pool.query(
      "select * from usuarios where email = $1 and id <> $2",
      [email, idUsuarioLogado(req, res)]
    );
    if (validarEmail.rowCount > 0) {
      return res.status(400).json({
        mensagem: "Já existe usuário cadastrado com o e-mail informado.",
      });
    }

    const atualizacaoUsuario = await pool.query(
      "update usuarios set nome = $1, email = $2, senha = $3 where id = $4",
      [
        nome,
        email,
        await senhaCriptografada(req, res),
        idUsuarioLogado(req, res),
      ]
    );

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  cadastrarUsuario,
  login,
  detalharUsuario,
  atualizarUsuario,
};
