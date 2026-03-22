const db = require("../config/db");

exports.listarBarbeiros = async (req, res) => {
  const { barbeariaId } = req.params;

  try {
    const [rows] = await db.query(
      `
        SELECT *
        FROM barbeiros
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

exports.criarBarbeiro = async (req, res) => {
  const { barbeariaId } = req.params;
  const {
    nome,
    foto,
    telefone,
    especialidade,
    percentual_comissao,
    status,
  } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "Nome do barbeiro é obrigatório" });
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO barbeiros
        (barbearia_id, nome, foto, telefone, especialidade, percentual_comissao, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        barbeariaId,
        nome,
        foto || null,
        telefone || null,
        especialidade || null,
        percentual_comissao ?? null,
        status || "ativo",
      ],
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Barbeiro criado com sucesso",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarBarbeiro = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    foto,
    telefone,
    especialidade,
    percentual_comissao,
    status,
  } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "Nome do barbeiro é obrigatório" });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE barbeiros
        SET nome = ?, foto = ?, telefone = ?, especialidade = ?, percentual_comissao = ?, status = ?
        WHERE id = ?
      `,
      [
        nome,
        foto || null,
        telefone || null,
        especialidade || null,
        percentual_comissao ?? null,
        status || "ativo",
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Barbeiro não encontrado" });
    }

    return res.json({ message: "Barbeiro atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.removerBarbeiro = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM barbeiros WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Barbeiro não encontrado" });
    }

    return res.json({ message: "Barbeiro removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
