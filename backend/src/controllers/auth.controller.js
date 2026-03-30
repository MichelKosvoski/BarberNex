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
    plano_codigo: row.plano_codigo || null,
    status_assinatura: row.status_assinatura || null,
    status_pagamento: row.status_pagamento || null,
  };
}

exports.register = async (req, res) => {
  const { nome, email, telefone, cpf, senha, tipo, barbearia_id } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, email e senha sao obrigatorios" });
  }

  const tipoFinal = tipo || "cliente";

  if (!["cliente", "dono", "funcionario", "master"].includes(tipoFinal)) {
    return res.status(400).json({ error: "Tipo de usuario invalido" });
  }

  if (!["cliente", "master"].includes(tipoFinal) && !barbearia_id) {
    return res.status(400).json({
      error: "Usuarios da barbearia precisam de uma barbearia vinculada",
    });
  }

  try {
    const [existing] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Ja existe uma conta com esse email" });
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
        SELECT u.*, b.nome AS barbearia_nome, b.status AS barbearia_status, b.plano, b.plano_codigo,
               b.status_assinatura, b.status_pagamento
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
    return res.status(400).json({ error: "Login e senha sao obrigatorios" });
  }

  try {
    const [rows] = await db.query(
      `
        SELECT u.*, b.nome AS barbearia_nome, b.status AS barbearia_status, b.plano, b.plano_codigo,
               b.status_assinatura, b.status_pagamento
        FROM usuarios u
        LEFT JOIN barbearias b ON b.id = u.barbearia_id
        WHERE u.email = ? OR u.telefone = ?
        LIMIT 1
      `,
      [login, login],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario nao encontrado" });
    }

    const user = rows[0];
    const senhaHash = hashSenha(senha);

    if (user.senha !== senhaHash) {
      return res.status(401).json({ error: "Senha invalida" });
    }

    if (user.status !== "ativo") {
      return res.status(403).json({ error: "Usuario inativo" });
    }

    if (
      (user.tipo === "dono" || user.tipo === "funcionario") &&
      user.barbearia_status !== "ativo"
    ) {
      return res.status(403).json({
        error: "Acesso da barbearia bloqueado ou inativo",
      });
    }

    if (
      (user.tipo === "dono" || user.tipo === "funcionario") &&
      ["bloqueada", "cancelada"].includes(user.status_assinatura)
    ) {
      return res.status(403).json({
        error: "Assinatura da barbearia bloqueada ou cancelada",
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
