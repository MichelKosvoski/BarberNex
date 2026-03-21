const produtos = [
  { nome: "Pomada modeladora", estoque: "18 un", preco: "R$ 39" },
  { nome: "Oleo para barba", estoque: "11 un", preco: "R$ 45" },
  { nome: "Shampoo masculino", estoque: "24 un", preco: "R$ 32" },
  { nome: "Kit premium", estoque: "7 un", preco: "R$ 99" },
];

export default function PainelProdutos() {
  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Produtos</p>
          <h3>Controle estoque, itens premium e produtos de giro rapido.</h3>
        </div>
      </div>

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Estoque atual</h4>
              <p>Produtos mais relevantes do caixa</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {produtos.map((produto) => (
              <div key={produto.nome} className="painel-list-item">
                <div>
                  <strong>{produto.nome}</strong>
                  <span>{produto.estoque}</span>
                </div>
                <strong>{produto.preco}</strong>
              </div>
            ))}
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
            <span className="painel-tag">Navalha premium - 4 un</span>
            <span className="painel-tag">Balm pos-barba - 3 un</span>
            <span className="painel-tag">Kit premium - 7 un</span>
          </div>
        </article>
      </div>
    </section>
  );
}
