const colunas = ["Horario", "Cliente", "Servico", "Barbeiro", "Status"];

const linhas = [
  ["09:00", "Marcos", "Corte", "Lucas", "Confirmado"],
  ["10:30", "Thiago", "Barba", "Pedro", "Em atendimento"],
  ["13:30", "Renan", "Corte + Barba", "Andre", "Aguardando"],
  ["15:00", "Felipe", "Sobrancelha", "Kaique", "Confirmado"],
];

export default function PainelAgenda() {
  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Agenda</p>
          <h3>Controle os atendimentos do dia, encaixes e confirmacoes.</h3>
        </div>
      </div>

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Resumo rapido</h4>
              <p>Vista geral da operacao de hoje</p>
            </div>
          </div>

          <div className="painel-info-stack">
            <div className="painel-info-pill">
              <span>Agendados</span>
              <strong>18</strong>
            </div>
            <div className="painel-info-pill">
              <span>Em atendimento</span>
              <strong>4</strong>
            </div>
            <div className="painel-info-pill">
              <span>Livres</span>
              <strong>12</strong>
            </div>
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Horarios de pico</h4>
              <p>Melhor distribuicao da equipe</p>
            </div>
          </div>

          <div className="painel-tag-grid">
            <span className="painel-tag">09:00 - lotado</span>
            <span className="painel-tag">13:30 - alto fluxo</span>
            <span className="painel-tag">16:00 - alto fluxo</span>
            <span className="painel-tag">19:30 - ultima vaga</span>
          </div>
        </article>
      </div>

      <article className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Agenda do dia</h4>
            <p>Organizacao visual do atendimento</p>
          </div>
        </div>

        <div className="painel-table-wrap">
          <table className="painel-table">
            <thead>
              <tr>
                {colunas.map((coluna) => (
                  <th key={coluna}>{coluna}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr key={linha.join("-")}>
                  {linha.map((celula) => (
                    <td key={celula}>{celula}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
