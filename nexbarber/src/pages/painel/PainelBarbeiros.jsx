const barbeiros = [
  { nome: "Claudio Machado", especialidade: "Barbeiro master", agenda: "Agenda 92%" },
  { nome: "Pedro Alves", especialidade: "Barba e navalhado", agenda: "Agenda 84%" },
  { nome: "Lucas Rocha", especialidade: "Fade premium", agenda: "Agenda 79%" },
];

export default function PainelBarbeiros() {
  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Barbeiros</p>
          <h3>Monitore desempenho, especialidades e taxa de ocupacao da equipe.</h3>
        </div>
      </div>

      <article className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Equipe ativa</h4>
            <p>Visao geral de performance</p>
          </div>
        </div>

        <div className="painel-ranking-list">
          {barbeiros.map((barbeiro) => (
            <article key={barbeiro.nome} className="painel-ranking-card">
              <div className="painel-ranking-avatar">{barbeiro.nome.charAt(0)}</div>
              <div className="painel-ranking-copy">
                <strong>{barbeiro.nome}</strong>
                <span>{barbeiro.especialidade}</span>
              </div>
              <strong className="painel-ranking-total">{barbeiro.agenda}</strong>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
