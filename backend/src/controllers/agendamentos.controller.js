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
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO agendamentos
      (barbearia_id, cliente_id, barbeiro_id, servico_id, data, hora, observacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        barbearia_id,
        cliente_id,
        barbeiro_id,
        servico_id,
        data,
        hora,
        observacao,
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

  try {
    const [rows] = await db.query(
      "SELECT * FROM agendamentos WHERE barbearia_id = ?",
      [id],
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
