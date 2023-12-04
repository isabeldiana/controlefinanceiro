const pool = require("../conexao");

const {
  verificadorCamposPreenchidosRegistroTransacao,
  verificadorCategoria,
  verificadorTipo,
  idUsuarioLogado,
  verificadorTransacaoDoUsuarioLogado,
} = require("../intermediario/filtros");

const cadastrarTransacao = async (req, res) => {
  const { tipo, descricao, valor, data, categoria_id } = req.body;

  try {
    if (!verificadorCamposPreenchidosRegistroTransacao(req, res)) {
      return res.status(400).json({
        mensagem: "Todos os campos obrigatórios devem ser informados.",
      });
    }
    if (!(await verificadorCategoria(req, res))) {
      return res.status(400).json({ mensagem: "Categoria não encontrada." });
    }

    const novaTransacao = await pool.query(
      "insert into transacoes(descricao, valor, data, categoria_id, tipo, usuario_id) values ($1,$2,$3,$4,$5,$6) returning *",
      [descricao, valor, data, categoria_id, tipo, idUsuarioLogado(req, res)]
    );

    const categoriaNome = await pool.query(
      "select c.descricao from categorias c inner join transacoes t on t.categoria_id = c.id where t.categoria_id = $1",
      [categoria_id]
    );

    const resultado = {
      id: novaTransacao.rows[0].id,
      tipo: novaTransacao.rows[0].tipo,
      descricao: novaTransacao.rows[0].descricao,
      valor: novaTransacao.rows[0].valor,
      data: novaTransacao.rows[0].data,
      usuario_id: novaTransacao.rows[0].usuario_id,
      categoria_id: novaTransacao.rows[0].categoria_id,
      categoria_nome: categoriaNome.rows[0].descricao,
    };

    return res.status(201).json(resultado);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarTransacoes = async (req, res) => {
  const filtros = req.query.filtro;

  try {
    const transacoes = await pool.query(
      "select * from transacoes where usuario_id = $1",
      [idUsuarioLogado(req, res)]
    );
    if (transacoes.rowCount < 1) {
      return res.send([]);
    }

    if (!filtros) {
      const transacoesDetalhadas = await pool.query(
        `select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as "categoria_nome"
          from transacoes t inner join categorias c on t.categoria_id = c.id where t.usuario_id = $1
        `,
        [idUsuarioLogado(req, res)]
      );

      return res.status(200).json(transacoesDetalhadas.rows);
    }

    if (filtros) {
      const listaTransacoesPorCategoria = [];
      for (let categoria = 0; categoria < filtros.length; categoria++) {
        const categoriaFiltroNome = await pool.query(
          "select categorias.descricao from categorias where categorias.descricao = $1",
          [filtros[categoria]]
        );
        if (categoriaFiltroNome.rowCount < 1) {
          return res.status(400).json({
            mensagem: "A categoria de filtragem informada não existe.",
          });
        }

        const transacoesDetalhadasPorCategoria = await pool.query(
          `select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as "categoria_nome"
            from transacoes t inner join categorias c on t.categoria_id = c.id where t.usuario_id = $1 and c.descricao = $2
          `,
          [idUsuarioLogado(req, res), filtros[categoria]]
        );
        listaTransacoesPorCategoria.push(transacoesDetalhadasPorCategoria.rows);
      }

      return res.json(listaTransacoesPorCategoria);
    }
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const exibirExtrato = async (req, res) => {
  try {
    const somaEntrada = await pool.query(
      "select coalesce(sum(valor), 0) as total from transacoes where tipo = 'entrada' and usuario_id = $1",
      [idUsuarioLogado(req, res)]
    );
    const somaSaida = await pool.query(
      "select coalesce(sum(valor), 0) as total from transacoes where tipo = 'saida' and usuario_id = $1",
      [idUsuarioLogado(req, res)]
    );

    const resultado = {
      entrada: somaEntrada.rows[0].total,
      saida: somaSaida.rows[0].total,
    };

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const detalharTransacao = async (req, res) => {
  const { id } = req.params;

  try {
    if (!(await verificadorTransacaoDoUsuarioLogado(req, res))) {
      return res.status(400).json({ mensagem: "Transação não encontrada." });
    }

    const transacaoDetalhada = await pool.query(
      `select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as "categoria_nome"
        from transacoes t inner join categorias c on t.categoria_id = c.id where t.id = $1
      `,
      [id]
    );

    const resultado = transacaoDetalhada.rows[0];

    return res.status(200).json(resultado);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const atualizarTransacao = async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, categoria_id, tipo } = req.body;

  try {
    if (!(await verificadorTransacaoDoUsuarioLogado(req, res))) {
      return res.status(400).json({ mensagem: "Transação não encontrada." });
    }
    if (!verificadorCamposPreenchidosRegistroTransacao(req, res)) {
      return res.status(400).json({
        mensagem: "Todos os campos obrigatórios devem ser informados.",
      });
    }
    if (!(await verificadorCategoria(req, res))) {
      return res.status(400).json({ mensagem: "Categoria não encontrada." });
    }
    if (!verificadorTipo(req, res)) {
      return res.status(400).json({
        mensagem: `O tipo informado deve ser ${"entrada"} ou ${"saida"}.`,
      });
    }

    const atualizarTransacao = await pool.query(
      "update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where id = $6",
      [descricao, valor, data, categoria_id, tipo, id]
    );

    return res.status(204);
  } catch (error) {
    return res.status(500).json("Erro interno do servidor");
  }
};

const excluirTransacao = async (req, res) => {
  const { id } = req.params;

  try {
    if (!(await verificadorTransacaoDoUsuarioLogado(req, res))) {
      return res.status(400).json({ mensagem: "Transação não encontrada." });
    }

    const excluirTransacao = pool.query(
      "delete from transacoes where id = $1",
      [id]
    );

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json("Erro interno do servidor");
  }
};

module.exports = {
  cadastrarTransacao,
  listarTransacoes,
  exibirExtrato,
  detalharTransacao,
  atualizarTransacao,
  excluirTransacao,
};
