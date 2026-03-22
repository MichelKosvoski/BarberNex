const db = require("../config/db");

// Criar agendamento
exports.criarAgendamento = async (req, res) => {
  const {
    barbearia_id,
    cliente_id,
    barbeiro_id,
    servico_id,
    data,
    hora,
    observacao,
    cliente_nome,
    cliente_telefone,
  } = req.body;

  if (!barbearia_id || !barbeiro_id || !servico_id || !data || !hora) {
    return res.status(400).json({ error: "Dados do agendamento incompletos" });
  }

  try {
    let clienteId = cliente_id || null;

    if (!clienteId) {
      if (!cliente_nome || !cliente_telefone) {
        return res
          .status(400)
          .json({ error: "Nome e telefone do cliente sao obrigatorios" });
      }

      const [clientesExistentes] = await db.query(
        `
          SELECT id
          FROM clientes
          WHERE barbearia_id = ? AND telefone = ?
          ORDER BY id DESC
          LIMIT 1
        `,
        [barbearia_id, cliente_telefone],
      );

      if (clientesExistentes.length > 0) {
        clienteId = clientesExistentes[0].id;
      } else {
        const [clienteResult] = await db.query(
          `
            INSERT INTO clientes (barbearia_id, nome, telefone)
            VALUES (?, ?, ?)
          `,
          [barbearia_id, cliente_nome, cliente_telefone],
        );

        clienteId = clienteResult.insertId;
      }
    }

    const [result] = await db.query(
      `INSERT INTO agendamentos
      (barbearia_id, cliente_id, barbeiro_id, servico_id, data, hora, observacao, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        barbearia_id,
        clienteId,
        barbeiro_id,
        servico_id,
        data,
        hora,
        observacao,
        "agendado",
      ],
    );

    res.json({
      message: "Agendamento criado",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Listar agendamentos
exports.listarAgendamentos = async (req, res) => {
  const { id } = req.params;
  const { data, status } = req.query;

  let sql = `
    SELECT a.*,
           c.nome AS cliente_nome,
           c.telefone AS cliente_telefone,
           b.nome AS barbeiro_nome,
           b.telefone AS barbeiro_telefone,
           s.nome AS servico_nome,
           s.preco AS servico_preco
    FROM agendamentos a
    INNER JOIN clientes c ON c.id = a.cliente_id
    INNER JOIN barbeiros b ON b.id = a.barbeiro_id
    INNER JOIN servicos s ON s.id = a.servico_id
    WHERE a.barbearia_id = ?
  `;
  const params = [id];

  if (data) {
    sql += " AND a.data = ?";
    params.push(data);
  }

  if (status) {
    sql += " AND a.status = ?";
    params.push(status);
  }

  sql += " ORDER BY a.data DESC, a.hora ASC";

  try {
    const [rows] = await db.query(sql, params);

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarStatusAgendamento = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status é obrigatório" });
  }

  try {
    const [result] = await db.query(
      "UPDATE agendamentos SET status = ? WHERE id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    return res.json({ message: "Status do agendamento atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarAgendamento = async (req, res) => {
  const { id } = req.params;
  const {
    barbeiro_id,
    servico_id,
    data,
    hora,
    observacao,
    status,
  } = req.body;

  if (!barbeiro_id || !servico_id || !data || !hora) {
    return res.status(400).json({ error: "Dados do agendamento incompletos" });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE agendamentos
        SET barbeiro_id = ?,
            servico_id = ?,
            data = ?,
            hora = ?,
            observacao = ?,
            status = ?
        WHERE id = ?
      `,
      [
        barbeiro_id,
        servico_id,
        data,
        hora,
        observacao || null,
        status || "agendado",
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Agendamento nao encontrado" });
    }

    return res.json({ message: "Agendamento atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.removerAgendamento = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM agendamentos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    return res.json({ message: "Agendamento removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
