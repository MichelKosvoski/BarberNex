import { useEffect, useState } from "react";
import { getPainelBarbeariaId, getProdutosPainel } from "../../services/api";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PainelProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const barbeariaId = getPainelBarbeariaId();

    async function carregarProdutos() {
      try {
        const data = await getProdutosPainel(barbeariaId);
        setProdutos(data);
      } catch (error) {
        setErro(error.message);
      }
    }

    carregarProdutos();
  }, []);

  const produtosBaixoEstoque = produtos.filter((produto) => Number(produto.estoque) <= 5);

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Produtos</p>
          <h3>Controle estoque, itens premium e produtos de giro rapido.</h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Estoque atual</h4>
              <p>Produtos mais relevantes do caixa</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {produtos.length > 0 ? (
              produtos.map((produto) => (
                <div key={produto.id} className="painel-list-item">
                  <div>
                    <strong>{produto.nome}</strong>
                    <span>{produto.estoque} un</span>
                  </div>
                  <strong>{formatCurrency(produto.preco)}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum produto cadastrado.</div>
            )}
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Alertas</h4>
              <p>Itens para reposicao nos proximos dias</p>
            </div>
          </div>

          <div className="painel-tag-grid">
            {produtosBaixoEstoque.length > 0 ? (
              produtosBaixoEstoque.map((produto) => (
                <span key={produto.id} className="painel-tag">
                  {produto.nome} - {produto.estoque} un
                </span>
              ))
            ) : (
              <div className="painel-empty-state">Sem alertas de estoque baixo.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
