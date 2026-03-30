const db = require("../config/db");

const MERCADO_PAGO_API_URL = "https://api.mercadopago.com";
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || "http://localhost:5173";
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || "http://localhost:3000";

function toNumber(value) {
  return Number(value || 0);
}

function hashSenha(senha) {
  return require("crypto").createHash("sha256").update(String(senha)).digest("hex");
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
    created_at: row.created_at || null,
    barbearia_nome: row.barbearia_nome || null,
    barbearia_status: row.barbearia_status || null,
    plano: row.plano || null,
    status_assinatura: row.status_assinatura || null,
    status_pagamento: row.status_pagamento || null,
  };
}

function parseBeneficios(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_error) {
    return String(value)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function stringifyBeneficios(value) {
  if (Array.isArray(value)) {
    return JSON.stringify(value.map((item) => String(item).trim()).filter(Boolean));
  }

  return JSON.stringify(
    String(value || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function normalizePlanoPlataforma(row) {
  if (!row) return null;

  return {
    id: row.id,
    codigo: row.codigo,
    nome: row.nome,
    descricao: row.descricao || "",
    destaque: row.destaque || "",
    valor_mensal: Number(row.valor_mensal || 0),
    beneficios: parseBeneficios(row.beneficios),
    escopo: row.escopo || "completo",
    premium: Boolean(row.premium),
    ordem: Number(row.ordem || 0),
    status: row.status || "ativo",
  };
}

async function buscarPlanoPlataformaPorReferencia({ id, codigo }) {
  if (!id && !codigo) return null;

  const [rows] = await db.query(
    `
      SELECT *
        FROM planos_plataforma
       WHERE (? IS NOT NULL AND id = ?)
          OR (? IS NOT NULL AND codigo = ?)
       LIMIT 1
    `,
    [id ?? null, id ?? null, codigo ?? null, codigo ?? null],
  );

  return rows[0] || null;
}

function parsePeriodo(periodo) {
  const mapa = {
    "1m": 1,
    "3m": 3,
    "6m": 6,
    "12m": 12,
    "24m": 24,
  };

  return mapa[periodo] || 12;
}

function getPeriodStart(months) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
}

function toSqlDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function formatMonth(date) {
  return date.toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
}

function buildBarbeariaFilters({ estado, cidade }) {
  const conditions = [];
  const params = [];

  if (estado) {
    conditions.push("b.estado = ?");
    params.push(estado);
  }

  if (cidade) {
    conditions.push("b.cidade = ?");
    params.push(cidade);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

function getMercadoPagoHeaders() {
  if (!MERCADO_PAGO_ACCESS_TOKEN) {
    const error = new Error("MERCADO_PAGO_ACCESS_TOKEN nao configurado");
    error.statusCode = 500;
    throw error;
  }

  return {
    Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function getPlanoDescricao(plano, descricao) {
  if (descricao) return descricao;
  if (String(plano || "").toLowerCase() === "prata") return "Assinatura Prata";
  if (String(plano || "").toLowerCase() === "gold") return "Assinatura Gold";
  if (plano === "Agenda") return "Assinatura Agenda";
  if (plano === "Completo") return "Assinatura Completo";
  return "Assinatura NexBarber";
}

async function ativarBarbeariaPorCobranca(cobranca, paidAt = null) {
  await db.query(
    `
      UPDATE barbearias
         SET status = 'ativo',
             status_assinatura = 'ativa',
             status_pagamento = 'pago',
             ultimo_pagamento = COALESCE(?, CURDATE()),
             valor_mensalidade = ?
       WHERE id = ?
    `,
    [paidAt, Number(cobranca.valor || 0), cobranca.barbearia_id],
  );
}

async function processarPagamentoMercadoPago(paymentId) {
  const response = await fetch(`${MERCADO_PAGO_API_URL}/v1/payments/${paymentId}`, {
    headers: getMercadoPagoHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Mercado Pago retornou ${response.status}: ${body}`);
    error.statusCode = response.status;
    throw error;
  }

  const payment = await response.json();
  const externalReference = String(payment.external_reference || "");
  const preferenceId = String(payment.order?.id || payment.preference_id || "");
  const [[cobranca]] = await db.query(
    `
      SELECT *
        FROM cobrancas
       WHERE id = ?
          OR mercado_pago_preference_id = ?
       LIMIT 1
    `,
    [Number(externalReference || 0), preferenceId],
  );

  if (!cobranca) {
    return { updated: false, payment };
  }

  let nextStatus = cobranca.status;
  const approvedAt = payment.date_approved
    ? new Date(payment.date_approved).toISOString().slice(0, 19).replace("T", " ")
    : null;

  if (payment.status === "approved") {
    nextStatus = "pago";
  } else if (payment.status === "cancelled" || payment.status === "rejected") {
    nextStatus = "cancelado";
  } else if (payment.status === "in_process" || payment.status === "pending") {
    nextStatus = "pendente";
  }

  await db.query(
    `
      UPDATE cobrancas
         SET status = ?,
             metodo = 'mercado_pago',
             mercado_pago_payment_id = ?,
             pago_em = CASE WHEN ? = 'pago' THEN COALESCE(pago_em, ?) ELSE pago_em END
       WHERE id = ?
    `,
    [nextStatus, String(payment.id), nextStatus, approvedAt, cobranca.id],
  );

  if (nextStatus === "pago") {
    await ativarBarbeariaPorCobranca(cobranca, approvedAt ? approvedAt.slice(0, 10) : null);
  } else if (nextStatus === "cancelado") {
    await db.query(
      `
        UPDATE barbearias
           SET status_assinatura = 'cancelada',
               status_pagamento = 'pendente'
         WHERE id = ?
      `,
      [cobranca.barbearia_id],
    );
  }

  return { updated: true, payment, cobrancaId: cobranca.id, status: nextStatus };
}

exports.resumoMaster = async (req, res) => {
  const periodo = req.query.periodo || "12m";
  const estado = req.query.estado || "";
  const cidade = req.query.cidade || "";
  const months = parsePeriodo(periodo);
  const manualInicio = toSqlDate(req.query.dataInicio);
  const manualFim = toSqlDate(req.query.dataFim);
  const periodStart = manualInicio ? new Date(`${manualInicio}T00:00:00`) : getPeriodStart(months);
  const periodStartSql = manualInicio || periodStart.toISOString().slice(0, 10);
  const periodEndSql = manualFim || new Date().toISOString().slice(0, 10);
  const filtros = buildBarbeariaFilters({ estado, cidade });

  const monthsBetween = (() => {
    if (!manualInicio || !manualFim) return months;
    const inicio = new Date(`${manualInicio}T00:00:00`);
    const fim = new Date(`${manualFim}T00:00:00`);
    const total = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth()) + 1;
    return Math.max(total, 1);
  })();

  try {
    const [[totais]] = await db.query(
      `
        SELECT
          COUNT(*) AS totalBarbearias,
          SUM(CASE WHEN b.status = 'ativo' THEN 1 ELSE 0 END) AS barbeariasAtivas,
          SUM(CASE WHEN b.status = 'inativo' THEN 1 ELSE 0 END) AS barbeariasInativas,
          SUM(CASE WHEN b.status_assinatura = 'pendente' THEN 1 ELSE 0 END) AS assinaturasPendentes,
          SUM(CASE WHEN b.status_assinatura = 'bloqueada' THEN 1 ELSE 0 END) AS assinaturasBloqueadas,
          SUM(CASE WHEN b.status_pagamento IN ('pendente', 'atrasado') THEN 1 ELSE 0 END) AS pagamentosPendentes,
          SUM(CASE WHEN b.destaque_home = 1 THEN 1 ELSE 0 END) AS destaquesAtivos,
          SUM(CASE WHEN b.status_assinatura = 'ativa' THEN b.valor_mensalidade ELSE 0 END) AS receitaMensalPrevista,
          SUM(
            CASE
              WHEN b.status_pagamento = 'pago'
               AND b.ultimo_pagamento IS NOT NULL
               AND b.ultimo_pagamento >= ?
               AND b.ultimo_pagamento <= ?
              THEN b.valor_mensalidade
              ELSE 0
            END
          ) AS receitaRecebidaPeriodo
        FROM barbearias b
        ${filtros.where}
      `,
      [periodStartSql, periodEndSql, ...filtros.params],
    );

    const [planos] = await db.query(
      `
        SELECT
          COALESCE(b.plano, 'Sem plano') AS plano,
          COUNT(*) AS total
        FROM barbearias b
        ${filtros.where}
        GROUP BY COALESCE(b.plano, 'Sem plano')
        ORDER BY total DESC, plano ASC
        LIMIT 6
      `,
      filtros.params,
    );

    const [ultimasBarbearias] = await db.query(
      `
        SELECT
          b.id,
          b.nome,
          b.cidade,
          b.estado,
          b.plano,
          b.status,
          b.status_assinatura,
          b.status_pagamento,
          b.valor_mensalidade,
          b.vencimento_assinatura,
          b.destaque_home,
          u.nome AS responsavel_nome,
          u.email AS responsavel_email,
          u.telefone AS responsavel_telefone
        FROM barbearias b
        LEFT JOIN usuarios u
          ON u.barbearia_id = b.id
         AND u.tipo = 'dono'
        ${filtros.where}
        ORDER BY b.created_at DESC, b.id DESC
        LIMIT 6
      `,
      filtros.params,
    );

    const [estadosRows] = await db.query(`
      SELECT DISTINCT estado
      FROM barbearias
      WHERE estado IS NOT NULL
        AND estado <> ''
      ORDER BY estado ASC
    `);

    const [cidadesRows] = await db.query(
      `
        SELECT DISTINCT cidade
        FROM barbearias
        WHERE cidade IS NOT NULL
          AND cidade <> ''
          ${estado ? "AND estado = ?" : ""}
        ORDER BY cidade ASC
      `,
      estado ? [estado] : [],
    );

    const [receitaRows] = await db.query(
      `
        SELECT
          DATE_FORMAT(b.ultimo_pagamento, '%Y-%m-01') AS mes,
          SUM(b.valor_mensalidade) AS receita
        FROM barbearias b
        ${filtros.where ? `${filtros.where} AND` : "WHERE"}
          b.status_pagamento = 'pago'
          AND b.ultimo_pagamento IS NOT NULL
          AND b.ultimo_pagamento >= ?
          AND b.ultimo_pagamento <= ?
        GROUP BY DATE_FORMAT(b.ultimo_pagamento, '%Y-%m-01')
        ORDER BY mes ASC
      `,
      [...filtros.params, periodStartSql, periodEndSql],
    );

    const [pendentesPorEstado] = await db.query(`
      SELECT
        COALESCE(estado, '--') AS estado,
        COUNT(*) AS total
      FROM barbearias
      WHERE status_pagamento IN ('pendente', 'atrasado')
      GROUP BY COALESCE(estado, '--')
      ORDER BY total DESC, estado ASC
      LIMIT 6
    `);

    const monthMap = new Map(
      receitaRows.map((item) => [item.mes, toNumber(item.receita)]),
    );

    const chart = [];
    const now = new Date();

    for (let index = monthsBetween - 1; index >= 0; index -= 1) {
      const date = manualInicio
        ? new Date(periodStart.getFullYear(), periodStart.getMonth() + (monthsBetween - 1 - index), 1)
        : new Date(now.getFullYear(), now.getMonth() - index, 1);
      const key = date.toISOString().slice(0, 10);
      chart.push({
        label: formatMonth(date),
        receita: monthMap.get(key) || 0,
      });
    }

    const faturamentoPeriodo = chart.reduce((sum, item) => sum + item.receita, 0);
    const mediaMensalPeriodo = monthsBetween > 0 ? faturamentoPeriodo / monthsBetween : 0;

    return res.json({
      filtros: {
        periodo,
        estado,
        cidade,
        dataInicio: periodStartSql,
        dataFim: periodEndSql,
        estados: estadosRows.map((item) => item.estado),
        cidades: cidadesRows.map((item) => item.cidade),
      },
      indicadores: {
        totalBarbearias: toNumber(totais.totalBarbearias),
        barbeariasAtivas: toNumber(totais.barbeariasAtivas),
        barbeariasInativas: toNumber(totais.barbeariasInativas),
        assinaturasPendentes: toNumber(totais.assinaturasPendentes),
        assinaturasBloqueadas: toNumber(totais.assinaturasBloqueadas),
        pagamentosPendentes: toNumber(totais.pagamentosPendentes),
        destaquesAtivos: toNumber(totais.destaquesAtivos),
        receitaMensalPrevista: toNumber(totais.receitaMensalPrevista),
        receitaRecebidaPeriodo: toNumber(totais.receitaRecebidaPeriodo),
        faturamentoPeriodo,
        mediaMensalPeriodo,
      },
      graficoFaturamento: chart,
      distribuicaoPlanos: Array.isArray(planos) ? planos : [],
      ultimasBarbearias,
      pendenciasPorEstado: pendentesPorEstado || [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listarPlanosPlataformaMaster = async (req, res) => {
  const somenteAtivos = String(req.query.status || "").trim() === "ativo";

  try {
    const [rows] = await db.query(
      `
        SELECT *
          FROM planos_plataforma
         ${somenteAtivos ? "WHERE status = 'ativo'" : ""}
         ORDER BY ordem ASC, id ASC
      `,
    );

    return res.json(rows.map(normalizePlanoPlataforma));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarPlanoPlataformaMaster = async (req, res) => {
  const {
    codigo,
    nome,
    descricao,
    destaque,
    valor_mensal,
    beneficios,
    escopo,
    premium,
    ordem,
    status,
  } = req.body;

  if (!codigo || !nome) {
    return res.status(400).json({ error: "Codigo e nome sao obrigatorios" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM planos_plataforma WHERE codigo = ? LIMIT 1",
      [String(codigo).trim().toLowerCase()],
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Ja existe um plano com esse codigo" });
    }

    const [result] = await db.query(
      `
        INSERT INTO planos_plataforma
          (codigo, nome, descricao, destaque, valor_mensal, beneficios, escopo, premium, ordem, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(codigo).trim().toLowerCase(),
        nome,
        descricao || null,
        destaque || null,
        Number(valor_mensal || 0),
        stringifyBeneficios(beneficios),
        escopo === "basico" ? "basico" : "completo",
        premium ? 1 : 0,
        Number(ordem || 0),
        status === "inativo" ? "inativo" : "ativo",
      ],
    );

    const [[plano]] = await db.query("SELECT * FROM planos_plataforma WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json({
      message: "Plano criado com sucesso",
      plano: normalizePlanoPlataforma(plano),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarPlanoPlataformaMaster = async (req, res) => {
  const { id } = req.params;
  const {
    codigo,
    nome,
    descricao,
    destaque,
    valor_mensal,
    beneficios,
    escopo,
    premium,
    ordem,
    status,
  } = req.body;

  try {
    const [[atual]] = await db.query("SELECT * FROM planos_plataforma WHERE id = ? LIMIT 1", [id]);

    if (!atual) {
      return res.status(404).json({ error: "Plano nao encontrado" });
    }

    const codigoFinal = String(codigo || atual.codigo).trim().toLowerCase();
    const nomeFinal = nome || atual.nome;

    const [duplicado] = await db.query(
      "SELECT id FROM planos_plataforma WHERE codigo = ? AND id <> ? LIMIT 1",
      [codigoFinal, id],
    );

    if (duplicado.length > 0) {
      return res.status(409).json({ error: "Ja existe outro plano com esse codigo" });
    }

    await db.query(
      `
        UPDATE planos_plataforma
           SET codigo = ?,
               nome = ?,
               descricao = ?,
               destaque = ?,
               valor_mensal = ?,
               beneficios = ?,
               escopo = ?,
               premium = ?,
               ordem = ?,
               status = ?
         WHERE id = ?
      `,
      [
        codigoFinal,
        nomeFinal,
        descricao ?? atual.descricao,
        destaque ?? atual.destaque,
        valor_mensal !== undefined ? Number(valor_mensal || 0) : Number(atual.valor_mensal || 0),
        beneficios !== undefined ? stringifyBeneficios(beneficios) : atual.beneficios,
        escopo === "basico" ? "basico" : escopo === "completo" ? "completo" : atual.escopo,
        premium !== undefined ? (premium ? 1 : 0) : atual.premium,
        ordem !== undefined ? Number(ordem || 0) : Number(atual.ordem || 0),
        status === "inativo" ? "inativo" : status === "ativo" ? "ativo" : atual.status,
        id,
      ],
    );

    await db.query(
      `
        UPDATE barbearias
           SET plano_codigo = ?,
               plano = ?
         WHERE plano_id = ?
      `,
      [codigoFinal, nomeFinal, id],
    );

    await db.query(
      `
        UPDATE cobrancas
           SET plano_codigo = ?,
               plano = ?
         WHERE plano_id = ?
      `,
      [codigoFinal, nomeFinal, id],
    );

    const [[planoAtualizado]] = await db.query("SELECT * FROM planos_plataforma WHERE id = ?", [id]);

    return res.json({
      message: "Plano atualizado com sucesso",
      plano: normalizePlanoPlataforma(planoAtualizado),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.removerPlanoPlataformaMaster = async (req, res) => {
  const { id } = req.params;

  try {
    const [[plano]] = await db.query("SELECT * FROM planos_plataforma WHERE id = ? LIMIT 1", [id]);

    if (!plano) {
      return res.status(404).json({ error: "Plano nao encontrado" });
    }

    const [[usoBarbearias]] = await db.query(
      "SELECT COUNT(*) AS total FROM barbearias WHERE plano_id = ?",
      [id],
    );
    const [[usoCobrancas]] = await db.query(
      "SELECT COUNT(*) AS total FROM cobrancas WHERE plano_id = ?",
      [id],
    );

    if (Number(usoBarbearias.total || 0) > 0 || Number(usoCobrancas.total || 0) > 0) {
      return res.status(409).json({
        error: "Esse plano esta vinculado a barbearias ou cobrancas e nao pode ser excluido",
      });
    }

    await db.query("DELETE FROM planos_plataforma WHERE id = ?", [id]);

    return res.json({ message: "Plano removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listarBarbeariasMaster = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        b.id,
        b.nome,
        b.cidade,
        b.estado,
        b.telefone,
        b.status,
        b.plano,
        b.plano_id,
        b.plano_codigo,
        b.status_assinatura,
        b.status_pagamento,
        b.vencimento_assinatura,
        b.ultimo_pagamento,
        b.valor_mensalidade,
        b.destaque_home,
        b.observacoes_admin,
        u.nome AS responsavel_nome,
        u.email AS responsavel_email,
        u.telefone AS responsavel_telefone
      FROM barbearias b
      LEFT JOIN usuarios u
        ON u.barbearia_id = b.id
       AND u.tipo = 'dono'
      ORDER BY b.nome ASC
    `);

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listarUsuariosMaster = async (req, res) => {
  const search = String(req.query.search || "").trim();
  const tipo = String(req.query.tipo || "").trim();
  const status = String(req.query.status || "").trim();
  const barbeariaId = String(req.query.barbearia_id || "").trim();

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(
      "(u.nome LIKE ? OR u.email LIKE ? OR COALESCE(u.telefone, '') LIKE ? OR COALESCE(b.nome, '') LIKE ?)",
    );
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (tipo) {
    conditions.push("u.tipo = ?");
    params.push(tipo);
  }

  if (status) {
    conditions.push("u.status = ?");
    params.push(status);
  }

  if (barbeariaId) {
    if (barbeariaId === "sem-barbearia") {
      conditions.push("u.barbearia_id IS NULL");
    } else {
      conditions.push("u.barbearia_id = ?");
      params.push(Number(barbeariaId));
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const [rows] = await db.query(
      `
        SELECT
          u.id,
          u.barbearia_id,
          u.nome,
          u.email,
          u.telefone,
          u.cpf,
          u.tipo,
          u.status,
          u.created_at,
          b.nome AS barbearia_nome,
          b.status AS barbearia_status,
          b.plano,
          b.status_assinatura,
          b.status_pagamento
        FROM usuarios u
        LEFT JOIN barbearias b ON b.id = u.barbearia_id
        ${where}
        ORDER BY
          CASE u.tipo
            WHEN 'master' THEN 1
            WHEN 'dono' THEN 2
            WHEN 'funcionario' THEN 3
            ELSE 4
          END,
          u.nome ASC
      `,
      params,
    );

    return res.json(rows.map(sanitizeUser));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarUsuarioMaster = async (req, res) => {
  const { nome, email, telefone, cpf, senha, tipo, status, barbearia_id } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, email e senha sao obrigatorios" });
  }

  const tipoFinal = tipo || "funcionario";

  if (!["funcionario", "dono", "master"].includes(tipoFinal)) {
    return res.status(400).json({ error: "Tipo de usuario invalido" });
  }

  if (tipoFinal !== "master" && !barbearia_id) {
    return res.status(400).json({
      error: "Selecione a barbearia para usuarios do tipo dono ou funcionario",
    });
  }

  try {
    const [existing] = await db.query("SELECT id FROM usuarios WHERE email = ? LIMIT 1", [email]);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Ja existe uma conta com esse email" });
    }

    if (tipoFinal !== "master") {
      const [[barbearia]] = await db.query("SELECT id FROM barbearias WHERE id = ? LIMIT 1", [
        Number(barbearia_id),
      ]);

      if (!barbearia) {
        return res.status(404).json({ error: "Barbearia nao encontrada" });
      }
    }

    const [result] = await db.query(
      `
        INSERT INTO usuarios
        (barbearia_id, nome, email, telefone, cpf, senha, tipo, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tipoFinal === "master" ? null : Number(barbearia_id),
        nome,
        email,
        telefone || null,
        cpf || null,
        hashSenha(senha),
        tipoFinal,
        status || "ativo",
      ],
    );

    const [[novoUsuario]] = await db.query(
      `
        SELECT
          u.id,
          u.barbearia_id,
          u.nome,
          u.email,
          u.telefone,
          u.cpf,
          u.tipo,
          u.status,
          u.created_at,
          b.nome AS barbearia_nome,
          b.status AS barbearia_status,
          b.plano,
          b.status_assinatura,
          b.status_pagamento
        FROM usuarios u
        LEFT JOIN barbearias b ON b.id = u.barbearia_id
        WHERE u.id = ?
        LIMIT 1
      `,
      [result.insertId],
    );

    return res.status(201).json({
      message: "Usuario cadastrado com sucesso",
      user: sanitizeUser(novoUsuario),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarUsuarioMaster = async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, cpf, senha, tipo, status, barbearia_id } = req.body;

  try {
    const [[atual]] = await db.query("SELECT * FROM usuarios WHERE id = ? LIMIT 1", [id]);

    if (!atual) {
      return res.status(404).json({ error: "Usuario nao encontrado" });
    }

    const tipoFinal = tipo || atual.tipo;
    const statusFinal = status || atual.status;
    const emailFinal = email || atual.email;
    const barbeariaFinal = tipoFinal === "master" ? null : Number(barbearia_id || atual.barbearia_id || 0);

    if (!["funcionario", "dono", "master"].includes(tipoFinal)) {
      return res.status(400).json({ error: "Tipo de usuario invalido" });
    }

    if (tipoFinal !== "master" && !barbeariaFinal) {
      return res.status(400).json({
        error: "Selecione a barbearia para usuarios do tipo dono ou funcionario",
      });
    }

    if (emailFinal !== atual.email) {
      const [existing] = await db.query(
        "SELECT id FROM usuarios WHERE email = ? AND id <> ? LIMIT 1",
        [emailFinal, id],
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: "Ja existe outra conta com esse email" });
      }
    }

    if (tipoFinal !== "master") {
      const [[barbearia]] = await db.query("SELECT id FROM barbearias WHERE id = ? LIMIT 1", [
        barbeariaFinal,
      ]);

      if (!barbearia) {
        return res.status(404).json({ error: "Barbearia nao encontrada" });
      }
    }

    await db.query(
      `
        UPDATE usuarios
           SET barbearia_id = ?,
               nome = ?,
               email = ?,
               telefone = ?,
               cpf = ?,
               senha = ?,
               tipo = ?,
               status = ?
         WHERE id = ?
      `,
      [
        barbeariaFinal,
        nome || atual.nome,
        emailFinal,
        telefone !== undefined ? telefone || null : atual.telefone,
        cpf !== undefined ? cpf || null : atual.cpf,
        senha ? hashSenha(senha) : atual.senha,
        tipoFinal,
        statusFinal,
        id,
      ],
    );

    const [[usuarioAtualizado]] = await db.query(
      `
        SELECT
          u.id,
          u.barbearia_id,
          u.nome,
          u.email,
          u.telefone,
          u.cpf,
          u.tipo,
          u.status,
          u.created_at,
          b.nome AS barbearia_nome,
          b.status AS barbearia_status,
          b.plano,
          b.status_assinatura,
          b.status_pagamento
        FROM usuarios u
        LEFT JOIN barbearias b ON b.id = u.barbearia_id
        WHERE u.id = ?
        LIMIT 1
      `,
      [id],
    );

    return res.json({
      message: "Usuario atualizado com sucesso",
      user: sanitizeUser(usuarioAtualizado),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarBarbeariaMaster = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    plano,
    plano_id,
    plano_codigo,
    status_assinatura,
    status_pagamento,
    vencimento_assinatura,
    ultimo_pagamento,
    valor_mensalidade,
    destaque_home,
    observacoes_admin,
  } = req.body;

  try {
    const [[atual]] = await db.query("SELECT * FROM barbearias WHERE id = ? LIMIT 1", [id]);

    if (!atual) {
      return res.status(404).json({ error: "Barbearia nao encontrada" });
    }

    let planoFinalId = atual.plano_id;
    let planoFinalCodigo = atual.plano_codigo;
    let planoFinalNome = atual.plano;

    if (plano_id || plano_codigo) {
      const planoSelecionado = await buscarPlanoPlataformaPorReferencia({
        id: plano_id ? Number(plano_id) : null,
        codigo: plano_codigo ? String(plano_codigo).trim().toLowerCase() : null,
      });

      if (!planoSelecionado) {
        return res.status(404).json({ error: "Plano da plataforma nao encontrado" });
      }

      planoFinalId = planoSelecionado.id;
      planoFinalCodigo = planoSelecionado.codigo;
      planoFinalNome = planoSelecionado.nome;
    } else if (plano === "") {
      planoFinalId = null;
      planoFinalCodigo = null;
      planoFinalNome = null;
    }

    const [result] = await db.query(
      `
        UPDATE barbearias
           SET status = COALESCE(?, status),
               plano = ?,
               plano_id = ?,
               plano_codigo = ?,
               status_assinatura = COALESCE(?, status_assinatura),
               status_pagamento = COALESCE(?, status_pagamento),
               vencimento_assinatura = ?,
               ultimo_pagamento = ?,
               valor_mensalidade = COALESCE(?, valor_mensalidade),
               destaque_home = COALESCE(?, destaque_home),
               observacoes_admin = ?
         WHERE id = ?
      `,
      [
        status || null,
        planoFinalNome,
        planoFinalId,
        planoFinalCodigo,
        status_assinatura || null,
        status_pagamento || null,
        vencimento_assinatura || null,
        ultimo_pagamento || null,
        valor_mensalidade ?? null,
        typeof destaque_home === "boolean" ? (destaque_home ? 1 : 0) : destaque_home ?? null,
        observacoes_admin ?? null,
        id,
      ],
    );

    return res.json({ message: "Barbearia atualizada com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listarCobrancasMaster = async (req, res) => {
  const status = req.query.status || "";
  const barbeariaId = req.query.barbearia_id || "";
  const search = req.query.search || "";

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("c.status = ?");
    params.push(status);
  }

  if (barbeariaId) {
    conditions.push("c.barbearia_id = ?");
    params.push(barbeariaId);
  }

  if (search) {
    conditions.push("(b.nome LIKE ? OR c.descricao LIKE ? OR COALESCE(c.plano, '') LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const [rows] = await db.query(
      `
        SELECT
          c.*,
          b.nome AS barbearia_nome,
          b.cidade AS barbearia_cidade,
          b.estado AS barbearia_estado,
          b.status AS barbearia_status,
          b.status_assinatura AS barbearia_status_assinatura,
          b.status_pagamento AS barbearia_status_pagamento
        FROM cobrancas c
        INNER JOIN barbearias b ON b.id = c.barbearia_id
        ${where}
        ORDER BY
          CASE c.status
            WHEN 'atrasado' THEN 1
            WHEN 'pendente' THEN 2
            WHEN 'pago' THEN 3
            ELSE 4
          END,
          c.vencimento ASC,
          c.id DESC
      `,
      params,
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarCobrancaMaster = async (req, res) => {
  const {
    barbearia_id,
    descricao,
    plano,
    plano_id,
    plano_codigo,
    referencia,
    valor,
    status,
    metodo,
    vencimento,
    checkout_url,
    observacoes,
  } = req.body;

  if (!barbearia_id || !descricao || valor === undefined || valor === null) {
    return res.status(400).json({ error: "Barbearia, descricao e valor sao obrigatorios" });
  }

  try {
    let planoFinalId = null;
    let planoFinalCodigo = null;
    let planoFinalNome = plano || null;

    if (plano_id || plano_codigo) {
      const planoSelecionado = await buscarPlanoPlataformaPorReferencia({
        id: plano_id ? Number(plano_id) : null,
        codigo: plano_codigo ? String(plano_codigo).trim().toLowerCase() : null,
      });

      if (!planoSelecionado) {
        return res.status(404).json({ error: "Plano da plataforma nao encontrado" });
      }

      planoFinalId = planoSelecionado.id;
      planoFinalCodigo = planoSelecionado.codigo;
      planoFinalNome = planoSelecionado.nome;
    } else if (plano === "") {
      planoFinalNome = null;
    }

    const pagoEm =
      status === "pago" ? new Date().toISOString().slice(0, 19).replace("T", " ") : null;

    const [result] = await db.query(
      `
        INSERT INTO cobrancas (
          barbearia_id,
          descricao,
          plano,
          plano_id,
          plano_codigo,
          referencia,
          valor,
          status,
          metodo,
          vencimento,
          pago_em,
          checkout_url,
          observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        barbearia_id,
        descricao,
        planoFinalNome,
        planoFinalId,
        planoFinalCodigo,
        referencia || null,
        Number(valor || 0),
        status || "pendente",
        metodo || "manual",
        vencimento || null,
        pagoEm,
        checkout_url || null,
        observacoes || null,
      ],
    );

    if (status === "pago") {
      await db.query(
        `
          UPDATE barbearias
             SET status = 'ativo',
                 status_assinatura = 'ativa',
                 status_pagamento = 'pago',
                 ultimo_pagamento = CURDATE(),
                 valor_mensalidade = ?
           WHERE id = ?
        `,
        [Number(valor || 0), barbearia_id],
      );
    }

    return res.status(201).json({ id: result.insertId, message: "Cobranca criada com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.atualizarCobrancaMaster = async (req, res) => {
  const { id } = req.params;
  const {
    descricao,
    plano,
    plano_id,
    plano_codigo,
    referencia,
    valor,
    status,
    metodo,
    vencimento,
    checkout_url,
    observacoes,
  } = req.body;

  try {
    const [[current]] = await db.query("SELECT * FROM cobrancas WHERE id = ?", [id]);

    if (!current) {
      return res.status(404).json({ error: "Cobranca nao encontrada" });
    }

    const nextStatus = status || current.status;
    const shouldMarkPaidNow = nextStatus === "pago" && current.status !== "pago";
    const paidAtValue =
      nextStatus === "pago"
        ? current.pago_em || new Date().toISOString().slice(0, 19).replace("T", " ")
        : null;

    let planoFinalId = current.plano_id;
    let planoFinalCodigo = current.plano_codigo;
    let planoFinalNome = current.plano;

    if (plano_id || plano_codigo) {
      const planoSelecionado = await buscarPlanoPlataformaPorReferencia({
        id: plano_id ? Number(plano_id) : null,
        codigo: plano_codigo ? String(plano_codigo).trim().toLowerCase() : null,
      });

      if (!planoSelecionado) {
        return res.status(404).json({ error: "Plano da plataforma nao encontrado" });
      }

      planoFinalId = planoSelecionado.id;
      planoFinalCodigo = planoSelecionado.codigo;
      planoFinalNome = planoSelecionado.nome;
    } else if (plano === "") {
      planoFinalId = null;
      planoFinalCodigo = null;
      planoFinalNome = null;
    }

    await db.query(
      `
        UPDATE cobrancas
           SET descricao = ?,
               plano = ?,
               plano_id = ?,
               plano_codigo = ?,
               referencia = ?,
               valor = ?,
               status = ?,
               metodo = ?,
               vencimento = ?,
               pago_em = ?,
               checkout_url = ?,
               observacoes = ?
         WHERE id = ?
      `,
      [
        descricao ?? current.descricao,
        planoFinalNome,
        planoFinalId,
        planoFinalCodigo,
        referencia ?? current.referencia,
        valor !== undefined ? Number(valor || 0) : Number(current.valor || 0),
        nextStatus,
        metodo ?? current.metodo,
        vencimento ?? current.vencimento,
        paidAtValue,
        checkout_url ?? current.checkout_url,
        observacoes ?? current.observacoes,
        id,
      ],
    );

    if (nextStatus === "pago") {
      await db.query(
        `
          UPDATE barbearias
             SET status = 'ativo',
                 status_assinatura = 'ativa',
                 status_pagamento = 'pago',
                 ultimo_pagamento = CURDATE(),
                 valor_mensalidade = ?
           WHERE id = ?
        `,
        [Number(valor ?? (current.valor || 0)), current.barbearia_id],
      );
    } else if (nextStatus === "atrasado") {
      await db.query(
        `
          UPDATE barbearias
             SET status_pagamento = 'atrasado',
                 status_assinatura = 'atrasada'
           WHERE id = ?
        `,
        [current.barbearia_id],
      );
    } else if (nextStatus === "pendente") {
      await db.query(
        `
          UPDATE barbearias
             SET status_pagamento = 'pendente'
           WHERE id = ?
        `,
        [current.barbearia_id],
      );
    } else if (nextStatus === "cancelado") {
      await db.query(
        `
          UPDATE barbearias
             SET status_assinatura = 'cancelada',
                 status_pagamento = 'pendente'
           WHERE id = ?
        `,
        [current.barbearia_id],
      );
    }

    return res.json({
      message: shouldMarkPaidNow
        ? "Cobranca atualizada e barbearia liberada"
        : "Cobranca atualizada com sucesso",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.removerCobrancaMaster = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM cobrancas WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cobranca nao encontrada" });
    }

    return res.json({ message: "Cobranca removida com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.gerarCheckoutCobrancaMaster = async (req, res) => {
  const { id } = req.params;

  try {
    const [[cobranca]] = await db.query(
      `
        SELECT c.*, b.nome AS barbearia_nome
          FROM cobrancas c
          INNER JOIN barbearias b ON b.id = c.barbearia_id
         WHERE c.id = ?
         LIMIT 1
      `,
      [id],
    );

    if (!cobranca) {
      return res.status(404).json({ error: "Cobranca nao encontrada" });
    }

    const payload = {
      items: [
        {
          id: String(cobranca.id),
          title: getPlanoDescricao(cobranca.plano, cobranca.descricao),
          description: `${cobranca.barbearia_nome} - ${cobranca.referencia || "Assinatura NexBarber"}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(cobranca.valor || 0),
        },
      ],
      external_reference: String(cobranca.id),
      notification_url: `${PUBLIC_API_URL}/api/master/webhooks/mercadopago`,
      back_urls: {
        success: `${PUBLIC_APP_URL}/master/pagamentos?checkout=success`,
        pending: `${PUBLIC_APP_URL}/master/pagamentos?checkout=pending`,
        failure: `${PUBLIC_APP_URL}/master/pagamentos?checkout=failure`,
      },
      auto_return: "approved",
      statement_descriptor: "NEXBARBER",
    };

    const response = await fetch(`${MERCADO_PAGO_API_URL}/checkout/preferences`, {
      method: "POST",
      headers: getMercadoPagoHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({
        error: `Falha ao gerar checkout no Mercado Pago: ${body}`,
      });
    }

    const data = await response.json();

    await db.query(
      `
        UPDATE cobrancas
           SET metodo = 'mercado_pago',
               checkout_url = ?,
               mercado_pago_preference_id = ?
         WHERE id = ?
      `,
      [data.init_point || data.sandbox_init_point || null, data.id || null, id],
    );

    return res.json({
      message: "Checkout gerado com sucesso",
      checkout_url: data.init_point || data.sandbox_init_point || null,
      mercado_pago_preference_id: data.id || null,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.webhookMercadoPagoMaster = async (req, res) => {
  try {
    const topic = req.query.topic || req.body.type || req.body.topic || "";
    const dataId = req.query["data.id"] || req.body?.data?.id || req.body?.resource?.split("/").pop();

    if ((topic === "payment" || req.body.type === "payment") && dataId) {
      await processarPagamentoMercadoPago(dataId);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
