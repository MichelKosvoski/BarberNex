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

function itemKey(item) {
  return `${item.tipo}-${item.referencia_id}`;
}

export default function PainelPdv() {
  const barbeariaId = getPainelBarbeariaId();
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [form, setForm] = useState({
    cliente_id: "",
    forma_pagamento: "Pix",
    desconto: "",
    observacoes: "",
  });

  async function carregarTudo() {
    try {
      setErro("");
      const [clientesData, servicosData, produtosData, vendasData] = await Promise.all([
        getClientesPainel(barbeariaId),
        getServicosPainel(barbeariaId),
        getProdutosPainel(barbeariaId),
        getPdvVendas(barbeariaId),
      ]);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setServicos(Array.isArray(servicosData) ? servicosData : []);
      setProdutos(Array.isArray(produtosData) ? produtosData : []);
      setVendas(Array.isArray(vendasData) ? vendasData : []);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const produtosDisponiveis = useMemo(
    () => produtos.filter((item) => item.status !== "inativo"),
    [produtos],
  );

  const servicosDisponiveis = useMemo(
    () => servicos.filter((item) => item.status !== "inativo"),
    [servicos],
  );

  const adicionarServico = (servico) => {
    const key = `servico-${servico.id}`;
    const jaExiste = itensCarrinho.some((item) => itemKey(item) === key);
    if (jaExiste) return;

    setItensCarrinho((prev) => [
      ...prev,
      {
        tipo: "servico",
        referencia_id: servico.id,
        nome: servico.nome,
        quantidade: 1,
        preco: Number(servico.preco || 0),
      },
    ]);
  };

  const adicionarProduto = (produto) => {
    setItensCarrinho((prev) => {
      const existente = prev.find(
        (item) => item.tipo === "produto" && item.referencia_id === produto.id,
      );

      if (existente) {
        return prev.map((item) =>
          item.tipo === "produto" && item.referencia_id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        );
      }

      return [
        ...prev,
        {
          tipo: "produto",
          referencia_id: produto.id,
          nome: produto.nome,
          quantidade: 1,
          preco: Number(produto.preco || 0),
        },
      ];
    });
  };

  const alterarQuantidade = (item, quantidade) => {
    const valor = Math.max(Number(quantidade || 1), 1);
    setItensCarrinho((prev) =>
      prev.map((linha) =>
        itemKey(linha) === itemKey(item) ? { ...linha, quantidade: valor } : linha,
      ),
    );
  };

  const removerItem = (item) => {
    setItensCarrinho((prev) => prev.filter((linha) => itemKey(linha) !== itemKey(item)));
  };

  const subtotal = itensCarrinho.reduce(
    (acc, item) => acc + Number(item.preco || 0) * Number(item.quantidade || 1),
    0,
  );
  const desconto = Number(form.desconto || 0);
  const total = Math.max(subtotal - desconto, 0);

  const registrarVenda = async (e) => {
    e.preventDefault();

    if (itensCarrinho.length === 0) {
      setErro("Adicione ao menos um servico ou produto ao caixa.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setFeedback("");

      await createPdvVenda(barbeariaId, {
        cliente_id: form.cliente_id || null,
        forma_pagamento: form.forma_pagamento,
        desconto,
        observacoes: form.observacoes,
        itens: itensCarrinho.map((item) => ({
          tipo: item.tipo,
          referencia_id: item.referencia_id,
          quantidade: item.quantidade,
        })),
      });

      setItensCarrinho([]);
      setForm({
        cliente_id: "",
        forma_pagamento: "Pix",
        desconto: "",
        observacoes: "",
      });
      setFeedback("Venda registrada com sucesso.");
      await carregarTudo();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">PDV</p>
          <h3>Monte o atendimento no caixa com servicos, bebidas e produtos da recepcao.</h3>
        </div>
      </div>

      {feedback ? <div className="painel-feedback">{feedback}</div> : null}
      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Adicionar servicos</h4>
              <p>Itens principais do atendimento</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {servicosDisponiveis.length > 0 ? (
              servicosDisponiveis.map((servico) => (
                <div key={servico.id} className="painel-list-item">
                  <div>
                    <strong>{servico.nome}</strong>
                    <span>{formatCurrency(servico.preco)}</span>
                  </div>
                  <button
                    type="button"
                    className="painel-table-btn is-confirm"
                    onClick={() => adicionarServico(servico)}
                  >
                    Adicionar
                  </button>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum servico ativo.</div>
            )}
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Bebidas e conveniencia</h4>
              <p>Itens de espera e venda rapida</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {produtosDisponiveis.length > 0 ? (
              produtosDisponiveis.map((produto) => (
                <div key={produto.id} className="painel-list-item">
                  <div>
                    <strong>{produto.nome}</strong>
                    <span>
                      {produto.estoque} un • {formatCurrency(produto.preco)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="painel-table-btn is-confirm"
                    onClick={() => adicionarProduto(produto)}
                  >
                    Adicionar
                  </button>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum produto ativo.</div>
            )}
          </div>
        </article>
      </div>

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Caixa atual</h4>
              <p>Revise o atendimento antes de registrar</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={registrarVenda}>
            <label className="painel-field">
              <span>Cliente</span>
              <select
                value={form.cliente_id}
                onChange={(e) => setForm((prev) => ({ ...prev, cliente_id: e.target.value }))}
              >
                <option value="">Venda de balcao / sem cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="painel-field">
              <span>Forma de pagamento</span>
              <select
                value={form.forma_pagamento}
                onChange={(e) => setForm((prev) => ({ ...prev, forma_pagamento: e.target.value }))}
              >
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Cartao Debito</option>
                <option>Cartao Credito</option>
              </select>
            </label>

            <label className="painel-field">
              <span>Desconto</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.desconto}
                onChange={(e) => setForm((prev) => ({ ...prev, desconto: e.target.value }))}
                placeholder="0,00"
              />
            </label>

            <label className="painel-field painel-field-full">
              <span>Observacoes</span>
              <textarea
                rows="4"
                value={form.observacoes}
                onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Ex: bebida servida na espera, desconto de fidelidade..."
              />
            </label>

            <div className="painel-form-actions">
              <button
                type="button"
                className="painel-table-btn is-danger-outline"
                onClick={() => setItensCarrinho([])}
              >
                Limpar caixa
              </button>
              <button type="submit" className="painel-primary-button" disabled={salvando}>
                {salvando ? "Registrando..." : "Registrar venda"}
              </button>
            </div>
          </form>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Itens selecionados</h4>
              <p>Carrinho do atendimento</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {itensCarrinho.length > 0 ? (
              itensCarrinho.map((item) => (
                <div key={itemKey(item)} className="painel-list-item">
                  <div>
                    <strong>{item.nome}</strong>
                    <span>
                      {item.tipo} • {formatCurrency(item.preco)}
                    </span>
                  </div>

                  <div className="painel-table-actions">
                    {item.tipo === "produto" ? (
                      <input
                        className="painel-inline-qty"
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => alterarQuantidade(item, e.target.value)}
                      />
                    ) : null}
                    <strong>{formatCurrency(item.preco * item.quantidade)}</strong>
                    <button
                      type="button"
                      className="painel-table-btn is-danger-outline"
                      onClick={() => removerItem(item)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum item no caixa.</div>
            )}
          </div>

          <div className="painel-total-box">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="painel-total-box">
            <span>Desconto</span>
            <strong>{formatCurrency(desconto)}</strong>
          </div>
          <div className="painel-total-box">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
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
