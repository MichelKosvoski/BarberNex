// Importa conexão com banco
const db = require("../config/db");

/*
  Lista todas barbearias ativas
  GET /api/barbearias
*/
exports.listarBarbearias = async (req, res) => {
  try {
    // Executa consulta no banco
    const [rows] = await db.query(
      "SELECT * FROM barbearias WHERE status='ativo'",
    );

    // Retorna resultado em JSON
    res.json(rows);
  } catch (error) {
    // Se ocorrer erro
    res.status(500).json({
      error: error.message,
    });
  }
};

/*
  Busca uma barbearia pelo ID
  GET /api/barbearias/:id
*/
exports.buscarBarbeariaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM barbearias WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Barbearia não encontrada",
      });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

/*
  Lista barbeiros de uma barbearia
  GET /api/barbearias/:id/barbeiros
*/
exports.listarBarbeiros = async (req, res) => {
  // pega ID da URL
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM barbeiros WHERE barbearia_id = ?",
      [id],
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/*
  Lista serviços da barbearia
  GET /api/barbearias/:id/servicos
*/
exports.listarServicos = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM servicos WHERE barbearia_id = ?",
      [id],
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
