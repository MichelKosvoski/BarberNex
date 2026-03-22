import { useEffect, useMemo, useState } from "react";
import {
  createPdvVenda,
  getClientesPainel,
  getPainelBarbeariaId,
  getPdvVendas,
  getProdutosPainel,
  getServicosPainel,
} from "../../services/api";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PainelPdv() {
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    cliente_id: "",
    forma_pagamento: "Pix",
    desconto: "",
    observacoes: "",
    servico_id: "",
    produto_id: "",
    quantidade_produto: 1,
  });

  const barbeariaId = getPainelBarbeariaId();

  async function carregarTudo() {
    try {
      const [clientesData, servicosData, produtosData, vendasData] = await Promise.all([
        getClientesPainel(barbeariaId),
        getServicosPainel(barbeariaId),
        getProdutosPainel(barbeariaId),
        getPdvVendas(barbeariaId),
      ]);
      setClientes(clientesData);
      setServicos(servicosData);
      setProdutos(produtosData);
      setVendas(vendasData);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const itensVenda = useMemo(() => {
    const itens = [];
    const servico = servicos.find((item) => String(item.id) === String(form.servico_id));
    const produto = produtos.find((item) => String(item.id) === String(form.produto_id));

    if (servico) {
      itens.push({
        tipo: "servico",
        referencia_id: servico.id,
        nome: servico.nome,
        quantidade: 1,
        preco: Number(servico.preco || 0),
      });
    }

    if (produto) {
      itens.push({
        tipo: "produto",
        referencia_id: produto.id,
        nome: produto.nome,
        quantidade: Number(form.quantidade_produto || 1),
        preco: Number(produto.preco || 0),
      });
    }

    return itens;
  }, [form, produtos, servicos]);

  const totalPrevio = itensVenda.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0,
  ) - Number(form.desconto || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setFeedback("");

    if (itensVenda.length === 0) {
      setErro("Selecione ao menos um servico ou produto.");
      return;
    }

    try {
      await createPdvVenda(barbeariaId, {
        cliente_id: form.cliente_id || null,
        forma_pagamento: form.forma_pagamento,
        desconto: Number(form.desconto || 0),
        observacoes: form.observacoes,
        itens: itensVenda.map((item) => ({
          tipo: item.tipo,
          referencia_id: item.referencia_id,
          quantidade: item.quantidade,
        })),
      });

      setForm({
        cliente_id: "",
        forma_pagamento: "Pix",
        desconto: "",
        observacoes: "",
        servico_id: "",
        produto_id: "",
        quantidade_produto: 1,
      });
      setFeedback("Venda registrada com sucesso.");
      await carregarTudo();
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">PDV</p>
          <h3>Registre servicos e produtos no caixa da barbearia com um fluxo simples.</h3>
        </div>
      </div>

      {feedback ? <div className="painel-feedback">{feedback}</div> : null}
      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Novo atendimento / venda</h4>
              <p>Monte o pedido e registre o pagamento</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handleSubmit}>
            <select
              value={form.cliente_id}
              onChange={(e) => setForm((prev) => ({ ...prev, cliente_id: e.target.value }))}
            >
              <option value="">Cliente opcional</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>

            <select
              value={form.servico_id}
              onChange={(e) => setForm((prev) => ({ ...prev, servico_id: e.target.value }))}
            >
              <option value="">Selecione um servico</option>
              {servicos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome}
                </option>
              ))}
            </select>

            <select
              value={form.produto_id}
              onChange={(e) => setForm((prev) => ({ ...prev, produto_id: e.target.value }))}
            >
              <option value="">Selecione um produto</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              placeholder="Quantidade do produto"
              value={form.quantidade_produto}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, quantidade_produto: e.target.value }))
              }
            />

            <select
              value={form.forma_pagamento}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, forma_pagamento: e.target.value }))
              }
            >
              <option>Pix</option>
              <option>Dinheiro</option>
              <option>Cartao Debito</option>
              <option>Cartao Credito</option>
            </select>

            <input
              placeholder="Desconto"
              value={form.desconto}
              onChange={(e) => setForm((prev) => ({ ...prev, desconto: e.target.value }))}
            />

            <textarea
              placeholder="Observacoes"
              value={form.observacoes}
              onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
            />

            <div className="painel-total-box">
              <span>Total previsto</span>
              <strong>{formatCurrency(Math.max(totalPrevio, 0))}</strong>
            </div>

            <button className="painel-primary-button" type="submit">
              Registrar venda
            </button>
          </form>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Resumo rapido</h4>
              <p>Itens selecionados para venda</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {itensVenda.length > 0 ? (
              itensVenda.map((item) => (
                <div
                  key={`${item.tipo}-${item.referencia_id}`}
                  className="painel-list-item"
                >
                  <div>
                    <strong>{item.nome}</strong>
                    <span>
                      {item.tipo} • {item.quantidade}x
                    </span>
                  </div>
                  <strong>{formatCurrency(item.preco * item.quantidade)}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum item selecionado.</div>
            )}
          </div>
        </article>
      </div>

      <article className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Ultimas vendas</h4>
            <p>Historico recente do caixa</p>
          </div>
        </div>

        <div className="painel-table-wrap">
          <table className="painel-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pagamento</th>
                <th>Total</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {vendas.length > 0 ? (
                vendas.map((venda) => (
                  <tr key={venda.id}>
                    <td>{venda.cliente_nome || "Balcao"}</td>
                    <td>{venda.forma_pagamento || "-"}</td>
                    <td>{formatCurrency(venda.total)}</td>
                    <td>{new Date(venda.created_at).toLocaleString("pt-BR")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="painel-empty-cell">
                    Nenhuma venda registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
