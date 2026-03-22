const db = require("../config/db");

exports.listarServicos = async (req, res) => {
  const { barbeariaId } = req.params;

  try {
    const [rows] = await db.query(
      `
        SELECT *
        FROM servicos
        WHERE barbearia_id = ?
        ORDER BY status DESC, nome ASC
      `,
      [barbeariaId],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarServico = async (req, res) => {
  const { barbeariaId } = req.params;
  const { nome, descricao, preco, duracao_minutos, categoria, imagem, status } = req.body;

  if (!nome || preco === undefined || !duracao_minutos) {
    return res.status(400).json({
      error: "Nome, preço e duração são obrigatórios",
    });
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO servicos
        (barbearia_id, nome, descricao, preco, duracao_minutos, categoria, imagem, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        barbeariaId,
        nome,
        descricao || null,
        preco,
        duracao_minutos,
        categoria || null,
        imagem || null,
        status || "ativo",
      ],
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Serviço criado com sucesso",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarServico = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, duracao_minutos, categoria, imagem, status } = req.body;

  if (!nome || preco === undefined || !duracao_minutos) {
    return res.status(400).json({
      error: "Nome, preço e duração são obrigatórios",
    });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE servicos
        SET nome = ?, descricao = ?, preco = ?, duracao_minutos = ?, categoria = ?, imagem = ?, status = ?
        WHERE id = ?
      `,
      [
        nome,
        descricao || null,
        preco,
        duracao_minutos,
        categoria || null,
        imagem || null,
        status || "ativo",
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    return res.json({ message: "Serviço atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.removerServico = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM servicos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    return res.json({ message: "Serviço removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
