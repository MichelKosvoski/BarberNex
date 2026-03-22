const db = require("../config/db");

exports.listarClientes = async (req, res) => {
  const { barbeariaId } = req.params;

  try {
    const [rows] = await db.query(
      `
        SELECT c.*,
               COUNT(a.id) AS total_agendamentos
        FROM clientes c
        LEFT JOIN agendamentos a ON a.cliente_id = c.id
        WHERE c.barbearia_id = ?
        GROUP BY c.id
        ORDER BY c.nome ASC
      `,
      [barbeariaId],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarCliente = async (req, res) => {
  const { barbeariaId } = req.params;
  const { nome, telefone, email, observacoes } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "Nome do cliente é obrigatório" });
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO clientes (barbearia_id, nome, telefone, email, observacoes)
        VALUES (?, ?, ?, ?, ?)
      `,
      [barbeariaId, nome, telefone || null, email || null, observacoes || null],
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Cliente criado com sucesso",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, email, observacoes } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "Nome do cliente é obrigatório" });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE clientes
        SET nome = ?, telefone = ?, email = ?, observacoes = ?
        WHERE id = ?
      `,
      [nome, telefone || null, email || null, observacoes || null, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    return res.json({ message: "Cliente atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.removerCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM clientes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    return res.json({ message: "Cliente removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
