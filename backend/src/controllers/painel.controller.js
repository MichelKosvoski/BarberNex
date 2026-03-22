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
        SELECT DATE_FORMAT(a.data, '%Y-%m') AS mes,
               COALESCE(SUM(s.preco), 0) AS total
        FROM agendamentos a
        INNER JOIN servicos s ON s.id = a.servico_id
        WHERE a.barbearia_id = ?
          AND a.status IN ('confirmado', 'finalizado')
          AND a.data >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
        GROUP BY DATE_FORMAT(a.data, '%Y-%m')
        ORDER BY mes ASC
      `,
      [barbeariaId],
    );

    return res.json({
      indicadores: {
        agendamentosHoje: agendamentosHoje.total,
        faturamentoHoje: Number(faturamentoHoje.total || 0),
        clientesAtivos: clientesAtivos.total,
        horariosLivres: Number(horariosLivres.total || 0),
      },
      agendamentosRecentes,
      rankingBarbeiros,
      faturamentoMensal,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
