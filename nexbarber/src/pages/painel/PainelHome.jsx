import {
  FiArrowUpRight,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

const indicadores = [
  {
    titulo: "Agendamentos Hoje",
    valor: "18",
    detalhe: "6 confirmados nas proximas 2 horas",
    icone: FiCalendar,
    destaque: "blue",
  },
  {
    titulo: "Faturamento Hoje",
    valor: "R$ 850",
    detalhe: "R$ 350 acima de ontem",
    icone: FiDollarSign,
    destaque: "green",
  },
  {
    titulo: "Clientes Ativos",
    valor: "124",
    detalhe: "+5 novos nesta semana",
    icone: FiUsers,
    destaque: "gold",
  },
  {
    titulo: "Horarios Livres",
    valor: "12",
    detalhe: "Ultimo horario disponivel as 19:30",
    icone: FiClock,
    destaque: "default",
  },
];

const meses = [
  { label: "Mai", value: 80 },
  { label: "Jun", value: 180 },
  { label: "Jul", value: 250 },
  { label: "Ago", value: 230 },
  { label: "Set", value: 210 },
  { label: "Out", value: 240 },
  { label: "Nov", value: 320 },
  { label: "Dez", value: 410 },
  { label: "Jan", value: 690 },
  { label: "Fev", value: 560 },
  { label: "Mar", value: 630 },
  { label: "Abr", value: 720 },
];

const agendamentos = [
  { cliente: "Joao", servico: "Corte", barbeiro: "Lucas", horario: "14:30" },
  { cliente: "Maria", servico: "Barba", barbeiro: "Pedro", horario: "15:00" },
  {
    cliente: "Carlos",
    servico: "Corte + Barba",
    barbeiro: "Andre",
    horario: "16:00",
  },
  {
    cliente: "Rafael",
    servico: "Pigmentacao",
    barbeiro: "Kaique",
    horario: "17:30",
  },
];

const barbeirosTop = [
  { nome: "Claudio Machado", cargo: "Barbeiro master", atendimentos: 32 },
  { nome: "Pedro Alves", cargo: "Especialista em barba", atendimentos: 27 },
  { nome: "Lucas Rocha", cargo: "Fade premium", atendimentos: 24 },
];

const pontos = meses
  .map((mes, index) => `${(index / (meses.length - 1)) * 100},${100 - mes.value / 8}`)
  .join(" ");

export default function PainelHome() {
  return (
    <section className="painel-content">
      <div className="painel-hero">
        <div>
          <p className="painel-eyebrow">Painel Administrativo</p>
          <h3>Bem-vindo de volta. Aqui estao os dados gerais da barbearia.</h3>
        </div>

        <button className="painel-primary-button" type="button">
          Ver agenda completa
          <FiArrowUpRight />
        </button>
      </div>

      <div className="painel-stats-grid">
        {indicadores.map((item) => {
          const Icon = item.icone;

          return (
            <article
              key={item.titulo}
              className={`painel-stat-card painel-accent-${item.destaque}`}
            >
              <div className="painel-stat-top">
                <span className="painel-stat-icon">
                  <Icon />
                </span>
                <span className="painel-stat-title">{item.titulo}</span>
              </div>

              <strong className="painel-stat-value">{item.valor}</strong>
              <p className="painel-stat-detail">{item.detalhe}</p>
            </article>
          );
        })}
      </div>

      <div className="painel-grid painel-grid-main">
        <section className="painel-card painel-chart-card">
          <div className="painel-card-header">
            <div>
              <h4>Faturamento Mensal</h4>
              <p className="painel-positive-copy">
                <FiTrendingUp />
                23% acima do mes anterior
              </p>
            </div>

            <button className="painel-filter-chip" type="button">
              Ultimos 12 meses
            </button>
          </div>

          <div className="painel-chart-shell">
            <svg viewBox="0 0 100 100" className="painel-chart-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartStroke" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#6ca8ff" />
                  <stop offset="100%" stopColor="#f6c445" />
                </linearGradient>
              </defs>

              <polyline
                className="painel-chart-line"
                fill="none"
                stroke="url(#chartStroke)"
                strokeWidth="2"
                points={pontos}
              />
            </svg>

            <div className="painel-chart-labels">
              {meses.map((mes) => (
                <span key={mes.label}>{mes.label}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Agendamentos Recentes</h4>
              <p>Movimento do caixa e da agenda</p>
            </div>
          </div>

          <div className="painel-mini-list">
            {agendamentos.slice(0, 3).map((item) => (
              <div key={`${item.cliente}-${item.horario}`} className="painel-mini-row">
                <div>
                  <strong>{item.cliente}</strong>
                  <span>
                    {item.servico} com {item.barbeiro}
                  </span>
                </div>
                <strong>{item.horario}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="painel-grid painel-grid-secondary">
        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Fila do Dia</h4>
              <p>Atendimentos confirmados e em andamento</p>
            </div>
          </div>

          <div className="painel-table-wrap">
            <table className="painel-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servico</th>
                  <th>Barbeiro</th>
                  <th>Horario</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.map((item) => (
                  <tr key={`${item.cliente}-${item.horario}`}>
                    <td>{item.cliente}</td>
                    <td>{item.servico}</td>
                    <td>{item.barbeiro}</td>
                    <td>{item.horario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Ranking de Barbeiros</h4>
              <p>Melhor desempenho do mes</p>
            </div>
          </div>

          <div className="painel-ranking-list">
            {barbeirosTop.map((barbeiro, index) => (
              <article key={barbeiro.nome} className="painel-ranking-card">
                <div className="painel-ranking-avatar">{barbeiro.nome.charAt(0)}</div>

                <div className="painel-ranking-copy">
                  <strong>
                    #{index + 1} {barbeiro.nome}
                  </strong>
                  <span>{barbeiro.cargo}</span>
                </div>

                <strong className="painel-ranking-total">
                  {barbeiro.atendimentos} atend.
                </strong>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
