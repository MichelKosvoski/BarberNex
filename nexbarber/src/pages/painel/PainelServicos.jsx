const servicos = [
  { nome: "Corte social", tempo: "40 min", preco: "R$ 45" },
  { nome: "Barba completa", tempo: "30 min", preco: "R$ 35" },
  { nome: "Corte + barba", tempo: "60 min", preco: "R$ 70" },
  { nome: "Pigmentacao", tempo: "25 min", preco: "R$ 28" },
];

export default function PainelServicos() {
  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Servicos</p>
          <h3>Organize o catalogo, tempo medio de execucao e precificacao.</h3>
        </div>
      </div>

      <article className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Catalogo principal</h4>
            <p>Servicos mais vendidos da semana</p>
          </div>
        </div>

        <div className="painel-list-grid">
          {servicos.map((servico) => (
            <div key={servico.nome} className="painel-list-item">
              <div>
                <strong>{servico.nome}</strong>
                <span>{servico.tempo}</span>
              </div>
              <strong>{servico.preco}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
