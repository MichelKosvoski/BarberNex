const clientes = [
  { nome: "Joao Mendes", visitas: "22 visitas", ticket: "R$ 110 medio" },
  { nome: "Carlos Prado", visitas: "15 visitas", ticket: "R$ 86 medio" },
  { nome: "Rafael Lima", visitas: "11 visitas", ticket: "R$ 134 medio" },
  { nome: "Matheus Alves", visitas: "8 visitas", ticket: "R$ 72 medio" },
];

export default function PainelClientes() {
  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Clientes</p>
          <h3>Veja recorrencia, ticket medio e relacionamento com a base ativa.</h3>
        </div>
      </div>

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Base ativa</h4>
              <p>Clientes recorrentes com maior potencial</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {clientes.map((cliente) => (
              <div key={cliente.nome} className="painel-list-item">
                <div>
                  <strong>{cliente.nome}</strong>
                  <span>{cliente.visitas}</span>
                </div>
                <strong>{cliente.ticket}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Indicadores</h4>
              <p>Resumo comercial da carteira</p>
            </div>
          </div>

          <div className="painel-info-stack">
            <div className="painel-info-pill">
              <span>Total cadastrados</span>
              <strong>124</strong>
            </div>
            <div className="painel-info-pill">
              <span>Retorno no mes</span>
              <strong>68%</strong>
            </div>
            <div className="painel-info-pill">
              <span>NPS interno</span>
              <strong>9.1</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
