const db = require("../config/db");

function toNumber(value) {
  return Number(value || 0);
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

exports.atualizarBarbeariaMaster = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    plano,
    status_assinatura,
    status_pagamento,
    vencimento_assinatura,
    ultimo_pagamento,
    valor_mensalidade,
    destaque_home,
    observacoes_admin,
  } = req.body;

  try {
    const [result] = await db.query(
      `
        UPDATE barbearias
           SET status = COALESCE(?, status),
               plano = COALESCE(?, plano),
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
        plano || null,
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

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Barbearia nao encontrada" });
    }

    return res.json({ message: "Barbearia atualizada com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
