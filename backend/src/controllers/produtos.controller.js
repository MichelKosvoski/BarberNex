const db = require("../config/db");

exports.listarProdutos = async (req, res) => {
  const { barbeariaId } = req.params;

  try {
    const [rows] = await db.query(
      `
        SELECT *
        FROM produtos
        WHERE barbearia_id = ?
        ORDER BY created_at DESC, nome ASC
      `,
      [barbeariaId],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarProduto = async (req, res) => {
  const { barbeariaId } = req.params;
  const { nome, descricao, preco, estoque, categoria, status } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: "Nome e preço são obrigatórios" });
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO produtos
        (barbearia_id, nome, descricao, preco, estoque, categoria, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        barbeariaId,
        nome,
        descricao || null,
        preco,
        estoque ?? 0,
        categoria || null,
        status || "ativo",
      ],
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Produto criado com sucesso",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, estoque, categoria, status } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: "Nome e preço são obrigatórios" });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE produtos
        SET nome = ?, descricao = ?, preco = ?, estoque = ?, categoria = ?, status = ?
        WHERE id = ?
      `,
      [nome, descricao || null, preco, estoque ?? 0, categoria || null, status || "ativo", id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.json({ message: "Produto atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.removerProduto = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM produtos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.json({ message: "Produto removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
