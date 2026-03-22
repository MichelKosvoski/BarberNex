const crypto = require("crypto");
const db = require("../config/db");

function hashSenha(senha) {
  return crypto.createHash("sha256").update(String(senha)).digest("hex");
}

function sanitizeUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    barbearia_id: row.barbearia_id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone || null,
    cpf: row.cpf || null,
    tipo: row.tipo,
    status: row.status,
    barbearia_nome: row.barbearia_nome || null,
    barbearia_status: row.barbearia_status || null,
    plano: row.plano || null,
  };
}

exports.register = async (req, res) => {
  const { nome, email, telefone, cpf, senha, tipo, barbearia_id } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
  }

  const tipoFinal = tipo || "cliente";

  if (!["cliente", "dono", "funcionario"].includes(tipoFinal)) {
    return res.status(400).json({ error: "Tipo de usuário inválido" });
  }

  if (tipoFinal !== "cliente" && !barbearia_id) {
    return res.status(400).json({
      error: "Usuários da barbearia precisam de uma barbearia vinculada",
    });
  }

  try {
    const [existing] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Já existe uma conta com esse email" });
    }

    const senhaHash = hashSenha(senha);
    const [result] = await db.query(
      `
        INSERT INTO usuarios
        (barbearia_id, nome, email, telefone, cpf, senha, tipo, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo')
      `,
      [
        barbearia_id || null,
        nome,
        email,
        telefone || null,
        cpf || null,
        senhaHash,
        tipoFinal,
      ],
    );

    const [rows] = await db.query(
      `
        SELECT u.*, b.nome AS barbearia_nome, b.status AS barbearia_status, b.plano
        FROM usuarios u
        LEFT JOIN barbearias b ON b.id = u.barbearia_id
        WHERE u.id = ?
      `,
      [result.insertId],
    );

    return res.status(201).json({
      message: "Conta criada com sucesso",
      user: sanitizeUser(rows[0]),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ error: "Login e senha são obrigatórios" });
  }

  try {
    const [rows] = await db.query(
      `
        SELECT u.*, b.nome AS barbearia_nome, b.status AS barbearia_status, b.plano
        FROM usuarios u
        LEFT JOIN barbearias b ON b.id = u.barbearia_id
        WHERE u.email = ? OR u.telefone = ?
        LIMIT 1
      `,
      [login, login],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const user = rows[0];
    const senhaHash = hashSenha(senha);

    if (user.senha !== senhaHash) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    if (user.status !== "ativo") {
      return res.status(403).json({ error: "Usuário inativo" });
    }

    if (
      (user.tipo === "dono" || user.tipo === "funcionario") &&
      user.barbearia_status !== "ativo"
    ) {
      return res.status(403).json({
        error: "Acesso da barbearia bloqueado ou inativo",
      });
    }

    return res.json({
      message: "Login realizado com sucesso",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
