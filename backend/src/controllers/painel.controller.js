const db = require("../config/db");

exports.resumoPainel = async (req, res) => {
  const { barbeariaId } = req.params;

  try {
    const [[agendamentosHoje]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM agendamentos
        WHERE barbearia_id = ? AND data = CURDATE()
      `,
      [barbeariaId],
    );

    const [[faturamentoHoje]] = await db.query(
      `
        SELECT COALESCE(SUM(s.preco), 0) AS total
        FROM agendamentos a
        INNER JOIN servicos s ON s.id = a.servico_id
        WHERE a.barbearia_id = ?
          AND a.data = CURDATE()
          AND a.status IN ('confirmado', 'finalizado')
      `,
      [barbeariaId],
    );

    const [[clientesAtivos]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM clientes
        WHERE barbearia_id = ?
      `,
      [barbeariaId],
    );

    const [[horariosLivres]] = await db.query(
      `
        SELECT GREATEST(0, 16 - COUNT(*)) AS total
        FROM agendamentos
        WHERE barbearia_id = ?
          AND data = CURDATE()
          AND status IN ('agendado', 'confirmado')
      `,
      [barbeariaId],
    );

    const [agendamentosRecentes] = await db.query(
      `
        SELECT a.id, a.data, a.hora, a.status,
               c.nome AS cliente_nome,
               b.nome AS barbeiro_nome,
               s.nome AS servico_nome,
               s.preco AS servico_preco
        FROM agendamentos a
        INNER JOIN clientes c ON c.id = a.cliente_id
        INNER JOIN barbeiros b ON b.id = a.barbeiro_id
        INNER JOIN servicos s ON s.id = a.servico_id
        WHERE a.barbearia_id = ?
        ORDER BY a.data DESC, a.hora DESC
        LIMIT 5
      `,
      [barbeariaId],
    );

    const [rankingBarbeiros] = await db.query(
      `
        SELECT b.id, b.nome, b.especialidade, COUNT(a.id) AS atendimentos
        FROM barbeiros b
        LEFT JOIN agendamentos a
          ON a.barbeiro_id = b.id
         AND a.status IN ('confirmado', 'finalizado')
        WHERE b.barbearia_id = ?
        GROUP BY b.id
        ORDER BY atendimentos DESC, b.nome ASC
        LIMIT 5
      `,
      [barbeariaId],
    );

    const [faturamentoMensal] = await db.query(
      `
        SELECT mes,
               SUM(entradas) AS entradas,
               SUM(saidas) AS saidas,
               SUM(entradas - saidas) AS liquido
        FROM (
          SELECT DATE_FORMAT(a.data, '%Y-%m') AS mes,
                 COALESCE(SUM(s.preco), 0) AS entradas,
                 0 AS saidas
          FROM agendamentos a
          INNER JOIN servicos s ON s.id = a.servico_id
          WHERE a.barbearia_id = ?
            AND a.status IN ('confirmado', 'finalizado')
            AND a.data >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
          GROUP BY DATE_FORMAT(a.data, '%Y-%m')

          UNION ALL

          SELECT DATE_FORMAT(COALESCE(d.competencia, d.created_at), '%Y-%m') AS mes,
                 0 AS entradas,
                 COALESCE(SUM(d.valor), 0) AS saidas
          FROM despesas d
          WHERE d.barbearia_id = ?
            AND COALESCE(d.competencia, d.created_at) >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
          GROUP BY DATE_FORMAT(COALESCE(d.competencia, d.created_at), '%Y-%m')
        ) consolidado
        GROUP BY mes
        ORDER BY mes ASC
      `,
      [barbeariaId, barbeariaId],
    );

    const [[saidasHoje]] = await db.query(
      `
        SELECT COALESCE(SUM(valor), 0) AS total
        FROM despesas
        WHERE barbearia_id = ?
          AND DATE(COALESCE(competencia, created_at)) = CURDATE()
      `,
      [barbeariaId],
    );

    const [[saidasMes]] = await db.query(
      `
        SELECT COALESCE(SUM(valor), 0) AS total
        FROM despesas
        WHERE barbearia_id = ?
          AND YEAR(COALESCE(competencia, created_at)) = YEAR(CURDATE())
          AND MONTH(COALESCE(competencia, created_at)) = MONTH(CURDATE())
      `,
      [barbeariaId],
    );

    const [despesasRecentes] = await db.query(
      `
        SELECT id, titulo, categoria, valor, competencia, created_at
        FROM despesas
        WHERE barbearia_id = ?
        ORDER BY COALESCE(competencia, created_at) DESC, id DESC
        LIMIT 6
      `,
      [barbeariaId],
    );

    const faturamentoHojeValor = Number(faturamentoHoje.total || 0);
    const saidasHojeValor = Number(saidasHoje.total || 0);
    const saidasMesValor = Number(saidasMes.total || 0);

    return res.json({
      indicadores: {
        agendamentosHoje: agendamentosHoje.total,
        faturamentoHoje: faturamentoHojeValor,
        saidasHoje: saidasHojeValor,
        lucroBrutoHoje: faturamentoHojeValor,
        lucroLiquidoHoje: faturamentoHojeValor - saidasHojeValor,
        saidasMes: saidasMesValor,
        clientesAtivos: clientesAtivos.total,
        horariosLivres: Number(horariosLivres.total || 0),
      },
      agendamentosRecentes,
      rankingBarbeiros,
      faturamentoMensal,
      despesasRecentes,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
