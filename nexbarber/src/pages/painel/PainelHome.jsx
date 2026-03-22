import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { getPainelBarbeariaId, getResumoPainel } from "../../services/api";

const iconMap = {
  "Agendamentos Hoje": FiCalendar,
  "Faturamento Hoje": FiDollarSign,
  "Clientes Ativos": FiUsers,
  "Horarios Livres": FiClock,
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getChartPoints(series) {
  if (series.length <= 1) {
    return "0,80 100,20";
  }

  const max = Math.max(...series.map((item) => Number(item.total || 0)), 1);

  return series
    .map((item, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 90 - (Number(item.total || 0) / max) * 70;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function PainelHome() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const barbeariaId = getPainelBarbeariaId();

    async function carregarResumo() {
      try {
        const resposta = await getResumoPainel(barbeariaId);
        setDados(resposta);
      } catch (error) {
        setErro(error.message);
      }
    }

    carregarResumo();
  }, []);

  const indicadoresApi = dados?.indicadores || {};
  const indicadores = [
    {
      titulo: "Agendamentos Hoje",
      valor: indicadoresApi.agendamentosHoje ?? 0,
      detalhe: "Agendamentos cadastrados para hoje",
      destaque: "blue",
    },
    {
      titulo: "Faturamento Hoje",
      valor: formatCurrency(indicadoresApi.faturamentoHoje),
      detalhe: "Servicos confirmados e finalizados",
      destaque: "green",
    },
    {
      titulo: "Clientes Ativos",
      valor: indicadoresApi.clientesAtivos ?? 0,
      detalhe: "Clientes cadastrados na base",
      destaque: "gold",
    },
    {
      titulo: "Horarios Livres",
      valor: indicadoresApi.horariosLivres ?? 0,
      detalhe: "Estimativa de disponibilidade do dia",
      destaque: "default",
    },
  ];

  const agendamentos = dados?.agendamentosRecentes || [];
  const barbeirosTop = dados?.rankingBarbeiros || [];
  const faturamentoMensal = dados?.faturamentoMensal || [];
  const pontos = getChartPoints(faturamentoMensal);

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

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-stats-grid">
        {indicadores.map((item) => {
          const Icon = iconMap[item.titulo];

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
                Receita confirmada nos ultimos meses
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
              {faturamentoMensal.length > 0 ? (
                faturamentoMensal.map((mes) => <span key={mes.mes}>{mes.mes.slice(5)}</span>)
              ) : (
                <span>Sem dados</span>
              )}
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
            {agendamentos.length > 0 ? (
              agendamentos.slice(0, 3).map((item) => (
                <div key={item.id} className="painel-mini-row">
                  <div>
                    <strong>{item.cliente_nome}</strong>
                    <span>
                      {item.servico_nome} com {item.barbeiro_nome}
                    </span>
                  </div>
                  <strong>{String(item.hora).slice(0, 5)}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum agendamento recente.</div>
            )}
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
                {agendamentos.length > 0 ? (
                  agendamentos.map((item) => (
                    <tr key={item.id}>
                      <td>{item.cliente_nome}</td>
                      <td>{item.servico_nome}</td>
                      <td>{item.barbeiro_nome}</td>
                      <td>{String(item.hora).slice(0, 5)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="painel-empty-cell">
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                )}
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
            {barbeirosTop.length > 0 ? (
              barbeirosTop.map((barbeiro, index) => (
                <article key={barbeiro.id} className="painel-ranking-card">
                  <div className="painel-ranking-avatar">{barbeiro.nome.charAt(0)}</div>

                  <div className="painel-ranking-copy">
                    <strong>
                      #{index + 1} {barbeiro.nome}
                    </strong>
                    <span>{barbeiro.especialidade || "Equipe ativa"}</span>
                  </div>

                  <strong className="painel-ranking-total">
                    {barbeiro.atendimentos} atend.
                  </strong>
                </article>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum barbeiro cadastrado.</div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
