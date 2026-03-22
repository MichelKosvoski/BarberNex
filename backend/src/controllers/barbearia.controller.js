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
  Atualiza os dados da barbearia
  PUT /api/barbearias/:id
*/
exports.atualizarBarbearia = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    cidade,
    estado,
    endereco,
    telefone,
    logo,
    banner,
    descricao,
    status,
    plano,
    cor_primaria,
    cor_secundaria,
    cor_fundo,
    texto_hero,
    subtitulo_hero,
    horario_funcionamento,
    exibir_planos_publico,
    titulo_planos_publico,
    subtitulo_planos_publico,
  } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "Nome da barbearia é obrigatório" });
  }

  try {
    const [result] = await db.query(
      `
        UPDATE barbearias
        SET nome = ?, cidade = ?, estado = ?, endereco = ?, telefone = ?,
            logo = ?, banner = ?, descricao = ?, status = ?, plano = ?,
            cor_primaria = ?, cor_secundaria = ?, cor_fundo = ?, texto_hero = ?,
            subtitulo_hero = ?, horario_funcionamento = ?, exibir_planos_publico = ?,
            titulo_planos_publico = ?, subtitulo_planos_publico = ?
        WHERE id = ?
      `,
      [
        nome,
        cidade || null,
        estado || null,
        endereco || null,
        telefone || null,
        logo || null,
        banner || null,
        descricao || null,
        status || "ativo",
        plano || null,
        cor_primaria || null,
        cor_secundaria || null,
        cor_fundo || null,
        texto_hero || null,
        subtitulo_hero || null,
        horario_funcionamento || null,
        exibir_planos_publico ? 1 : 0,
        titulo_planos_publico || null,
        subtitulo_planos_publico || null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Barbearia não encontrada" });
    }

    return res.json({ message: "Barbearia atualizada com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
