const db = require("../config/db");

exports.listarVendas = async (req, res) => {
  const { barbeariaId } = req.params;

  try {
    const [rows] = await db.query(
      `
        SELECT v.*, c.nome AS cliente_nome
        FROM pdv_vendas v
        LEFT JOIN clientes c ON c.id = v.cliente_id
        WHERE v.barbearia_id = ?
        ORDER BY v.created_at DESC
        LIMIT 30
      `,
      [barbeariaId],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listarVendaItens = async (req, res) => {
  const { vendaId } = req.params;

  try {
    const [rows] = await db.query(
      `
        SELECT *
        FROM pdv_venda_itens
        WHERE venda_id = ?
        ORDER BY id ASC
      `,
      [vendaId],
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.criarVenda = async (req, res) => {
  const { barbeariaId } = req.params;
  const { cliente_id, desconto, forma_pagamento, observacoes, itens } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: "A venda precisa ter ao menos um item" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let subtotal = 0;
    const itensNormalizados = [];

    for (const item of itens) {
      const quantidade = Number(item.quantidade || 1);
      if (!item.tipo || !item.referencia_id || quantidade <= 0) {
        throw new Error("Item de venda invalido");
      }

      let sql = "";
      if (item.tipo === "servico") {
        sql = "SELECT id, nome, preco FROM servicos WHERE id = ? AND barbearia_id = ?";
      } else if (item.tipo === "produto") {
        sql = "SELECT id, nome, preco, estoque FROM produtos WHERE id = ? AND barbearia_id = ?";
      } else {
        throw new Error("Tipo de item invalido");
      }

      const [referencias] = await connection.query(sql, [item.referencia_id, barbeariaId]);

      if (referencias.length === 0) {
        throw new Error("Item nao encontrado na barbearia");
      }

      const referencia = referencias[0];
      if (item.tipo === "produto" && Number(referencia.estoque || 0) < quantidade) {
        throw new Error(`Estoque insuficiente para ${referencia.nome}`);
      }

      const precoUnitario = Number(referencia.preco || 0);
      const totalItem = precoUnitario * quantidade;
      subtotal += totalItem;

      itensNormalizados.push({
        tipo: item.tipo,
        referencia_id: item.referencia_id,
        nome: referencia.nome,
        quantidade,
        precoUnitario,
        totalItem,
      });
    }

    const descontoFinal = Number(desconto || 0);
    const total = Math.max(subtotal - descontoFinal, 0);

    const [result] = await connection.query(
      `
        INSERT INTO pdv_vendas
        (barbearia_id, cliente_id, subtotal, desconto, total, forma_pagamento, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        barbeariaId,
        cliente_id || null,
        subtotal,
        descontoFinal,
        total,
        forma_pagamento || null,
        observacoes || null,
      ],
    );

    for (const item of itensNormalizados) {
      await connection.query(
        `
          INSERT INTO pdv_venda_itens
          (venda_id, tipo, referencia_id, nome, quantidade, preco_unitario, total_item)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          result.insertId,
          item.tipo,
          item.referencia_id,
          item.nome,
          item.quantidade,
          item.precoUnitario,
          item.totalItem,
        ],
      );

      if (item.tipo === "produto") {
        await connection.query(
          "UPDATE produtos SET estoque = estoque - ? WHERE id = ?",
          [item.quantidade, item.referencia_id],
        );
      }
    }

    await connection.commit();

    return res.status(201).json({
      id: result.insertId,
      message: "Venda registrada com sucesso",
      subtotal,
      total,
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};
