const db = require("../config/db");

exports.listarDespesas = async (req, res) => {
  const { barbeariaId } = req.params;

  try {
    const [rows] = await db.query(
      `
        SELECT *
        FROM despesas
        WHERE barbearia_id = ?
        ORDER BY COALESCE(competencia, created_at) DESC, id DESC
      `,
      [barbeariaId],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarDespesa = async (req, res) => {
  const { barbeariaId } = req.params;
  const { titulo, categoria, valor, competencia, observacoes } = req.body;

  if (!titulo || valor === undefined) {
    return res.status(400).json({ error: "Titulo e valor sao obrigatorios" });
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO despesas (barbearia_id, titulo, categoria, valor, competencia, observacoes)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        barbeariaId,
        titulo,
        categoria || null,
        Number(valor || 0),
        competencia || null,
        observacoes || null,
      ],
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Despesa cadastrada com sucesso",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.removerDespesa = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM despesas WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Despesa nao encontrada" });
    }

    return res.json({ message: "Despesa removida com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
