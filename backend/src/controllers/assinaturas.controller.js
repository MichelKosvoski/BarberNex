const db = require("../config/db");

exports.listarPlanos = async (req, res) => {
  const { barbeariaId } = req.params;

  try {
    const [rows] = await db.query(
      `
        SELECT *
        FROM planos_assinatura
        WHERE barbearia_id = ?
        ORDER BY status DESC, created_at DESC
      `,
      [barbeariaId],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarPlano = async (req, res) => {
  const { barbeariaId } = req.params;
  const {
    nome,
    descricao,
    preco,
    cortes_inclusos,
    barbas_inclusas,
    beneficios,
    recorrencia,
    status,
  } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: "Nome e preco sao obrigatorios" });
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO planos_assinatura
        (barbearia_id, nome, descricao, preco, cortes_inclusos, barbas_inclusas, beneficios, recorrencia, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        barbeariaId,
        nome,
        descricao || null,
        preco,
        cortes_inclusos ?? 0,
        barbas_inclusas ?? 0,
        beneficios || null,
        recorrencia || "mensal",
        status || "ativo",
      ],
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Plano criado com sucesso",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarPlano = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    descricao,
    preco,
    cortes_inclusos,
    barbas_inclusas,
    beneficios,
    recorrencia,
    status,
  } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: "Nome e preco sao obrigatorios" });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE planos_assinatura
        SET nome = ?, descricao = ?, preco = ?, cortes_inclusos = ?, barbas_inclusas = ?,
            beneficios = ?, recorrencia = ?, status = ?
        WHERE id = ?
      `,
      [
        nome,
        descricao || null,
        preco,
        cortes_inclusos ?? 0,
        barbas_inclusas ?? 0,
        beneficios || null,
        recorrencia || "mensal",
        status || "ativo",
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Plano nao encontrado" });
    }

    return res.json({ message: "Plano atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.removerPlano = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM planos_assinatura WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Plano nao encontrado" });
    }

    return res.json({ message: "Plano removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listarAssinaturasClientes = async (req, res) => {
  const { barbeariaId } = req.params;

  try {
    const [rows] = await db.query(
      `
        SELECT ca.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone,
               p.nome AS plano_nome, p.preco AS plano_preco
        FROM clientes_assinaturas ca
        INNER JOIN clientes c ON c.id = ca.cliente_id
        INNER JOIN planos_assinatura p ON p.id = ca.plano_id
        WHERE ca.barbearia_id = ?
        ORDER BY ca.created_at DESC
      `,
      [barbeariaId],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarAssinaturaCliente = async (req, res) => {
  const { barbeariaId } = req.params;
  const {
    cliente_id,
    plano_id,
    status,
    data_inicio,
    data_vencimento,
    observacoes,
  } = req.body;

  if (!cliente_id || !plano_id) {
    return res.status(400).json({ error: "Cliente e plano sao obrigatorios" });
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO clientes_assinaturas
        (barbearia_id, cliente_id, plano_id, status, data_inicio, data_vencimento, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        barbeariaId,
        cliente_id,
        plano_id,
        status || "ativa",
        data_inicio || null,
        data_vencimento || null,
        observacoes || null,
      ],
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Assinatura criada com sucesso",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarAssinaturaCliente = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    cortes_utilizados,
    barbas_utilizadas,
    data_inicio,
    data_vencimento,
    observacoes,
  } = req.body;

  try {
    const [result] = await db.query(
      `
        UPDATE clientes_assinaturas
        SET status = ?, cortes_utilizados = ?, barbas_utilizadas = ?,
            data_inicio = ?, data_vencimento = ?, observacoes = ?
        WHERE id = ?
      `,
      [
        status || "ativa",
        cortes_utilizados ?? 0,
        barbas_utilizadas ?? 0,
        data_inicio || null,
        data_vencimento || null,
        observacoes || null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Assinatura nao encontrada" });
    }

    return res.json({ message: "Assinatura atualizada com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
