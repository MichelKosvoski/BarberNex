import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTrendingDown,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import {
  createDespesa,
  deleteDespesa,
  getPainelBarbeariaId,
  getResumoPainel,
} from "../../services/api";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getChartMetrics(series) {
  const values = series.flatMap((item) => [
    Number(item.entradas || 0),
    Number(item.liquido || 0),
  ]);

  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      zeroY: 55,
      hasData: false,
    };
  }

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const zeroY = 10 + ((max - 0) / range) * 80;

  return {
    min,
    max,
    zeroY,
    hasData: values.some((value) => value !== 0),
  };
}

function getChartPoints(series, key, metrics) {
  if (series.length === 0) {
    return "";
  }

  if (!metrics.hasData) {
    return series
      .map((_, index) => {
        const x = series.length === 1 ? 50 : (index / (series.length - 1)) * 100;
        return `${x},${metrics.zeroY}`;
      })
      .join(" ");
  }

  return series
    .map((item, index) => {
      const x = series.length === 1 ? 50 : (index / (series.length - 1)) * 100;
      const value = Number(item[key] || 0);
      const y = 10 + ((metrics.max - value) / ((metrics.max - metrics.min) || 1)) * 80;
      return `${x},${y}`;
    })
    .join(" ");
}

const initialDespesa = {
  titulo: "",
  categoria: "Energia",
  valor: "",
  competencia: "",
  observacoes: "",
};

export default function PainelHome() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [salvandoDespesa, setSalvandoDespesa] = useState(false);
  const [formDespesa, setFormDespesa] = useState(initialDespesa);

  const barbeariaId = getPainelBarbeariaId();

  async function carregarResumo() {
    try {
      const resposta = await getResumoPainel(barbeariaId);
      setDados(resposta);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarResumo();
  }, []);

  const indicadoresApi = dados?.indicadores || {};
  const indicadores = [
    {
      titulo: "Agendamentos Hoje",
      valor: indicadoresApi.agendamentosHoje ?? 0,
      detalhe: "Agenda prevista para hoje",
      destaque: "blue",
      icon: FiCalendar,
    },
    {
      titulo: "Entradas Hoje",
      valor: formatCurrency(indicadoresApi.faturamentoHoje),
      detalhe: "Receita confirmada do dia",
      destaque: "green",
      icon: FiDollarSign,
    },
    {
      titulo: "Saidas Hoje",
      valor: formatCurrency(indicadoresApi.saidasHoje),
      detalhe: "Contas e custos lancados hoje",
      destaque: "danger",
      icon: FiTrendingDown,
    },
    {
      titulo: "Lucro Liquido",
      valor: formatCurrency(indicadoresApi.lucroLiquidoHoje),
      detalhe: "Entradas menos saidas do dia",
      destaque: "gold",
      icon: FiTrendingUp,
    },
    {
      titulo: "Clientes Ativos",
      valor: indicadoresApi.clientesAtivos ?? 0,
      detalhe: "Clientes cadastrados na base",
      destaque: "default",
      icon: FiUsers,
    },
    {
      titulo: "Horarios Livres",
      valor: indicadoresApi.horariosLivres ?? 0,
      detalhe: "Disponibilidade estimada",
      destaque: "default",
      icon: FiClock,
    },
  ];

  const agendamentos = dados?.agendamentosRecentes || [];
  const barbeirosTop = dados?.rankingBarbeiros || [];
  const faturamentoMensal = dados?.faturamentoMensal || [];
  const despesasRecentes = dados?.despesasRecentes || [];
  const chartMetrics = getChartMetrics(faturamentoMensal);
  const pontosEntradas = getChartPoints(faturamentoMensal, "entradas", chartMetrics);
  const pontosLiquido = getChartPoints(faturamentoMensal, "liquido", chartMetrics);

  const salvarDespesa = async (e) => {
    e.preventDefault();

    try {
      setErro("");
      setFeedback("");
      setSalvandoDespesa(true);

      await createDespesa(barbeariaId, {
        titulo: formDespesa.titulo,
        categoria: formDespesa.categoria,
        valor: Number(formDespesa.valor || 0),
        competencia: formDespesa.competencia || null,
        observacoes: formDespesa.observacoes,
      });

      setFormDespesa(initialDespesa);
      setFeedback("Saida cadastrada com sucesso.");
      await carregarResumo();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvandoDespesa(false);
    }
  };

  const removerDespesaRapida = async (id) => {
    try {
      setErro("");
      setFeedback("");
      await deleteDespesa(id);
      setFeedback("Saida removida com sucesso.");
      await carregarResumo();
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero">
        <div>
          <p className="painel-eyebrow">Painel Administrativo</p>
          <h3>Veja entradas, saidas e lucro do dia sem perder o controle financeiro da barbearia.</h3>
        </div>

        <Link
          to="/painel/agenda"
          className="painel-primary-button"
        >
          Ver agenda completa
          <FiArrowUpRight />
        </Link>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}
      {feedback ? <div className="painel-feedback">{feedback}</div> : null}

      <div className="painel-stats-grid painel-stats-grid-6">
        {indicadores.map((item) => {
          const Icon = item.icon;

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
              <h4>Entradas x Lucro Mensal</h4>
              <p className="painel-positive-copy">
                <FiTrendingUp />
                Acompanhe o caixa e o lucro liquido dos ultimos meses
              </p>
            </div>

            <button className="painel-filter-chip" type="button">
              Ultimos 12 meses
            </button>
          </div>

          <div className={`painel-chart-shell ${!chartMetrics.hasData ? "is-empty" : ""}`}>
            <svg viewBox="0 0 100 100" className="painel-chart-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartStrokeEntradas" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#6ca8ff" />
                  <stop offset="100%" stopColor="#f6c445" />
                </linearGradient>
                <linearGradient id="chartStrokeLiquido" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#75f0af" />
                  <stop offset="100%" stopColor="#6ca8ff" />
                </linearGradient>
              </defs>

              <line
                className="painel-chart-zero-line"
                x1="0"
                x2="100"
                y1={chartMetrics.zeroY}
                y2={chartMetrics.zeroY}
              />

              {pontosEntradas ? (
                <polyline
                  className="painel-chart-line"
                  fill="none"
                  stroke="url(#chartStrokeEntradas)"
                  strokeWidth="2"
                  points={pontosEntradas}
                />
              ) : null}
              {pontosLiquido ? (
                <polyline
                  className="painel-chart-line painel-chart-line-secondary"
                  fill="none"
                  stroke="url(#chartStrokeLiquido)"
                  strokeWidth="2"
                  points={pontosLiquido}
                />
              ) : null}
            </svg>

            <div className="painel-chart-legend">
              <span><i className="is-entradas" /> Entradas</span>
              <span><i className="is-liquido" /> Liquido</span>
            </div>

            <div className="painel-chart-labels">
              {faturamentoMensal.length > 0 ? (
                faturamentoMensal.map((mes) => <span key={mes.mes}>{mes.mes.slice(5)}</span>)
              ) : (
                <span>Sem dados</span>
              )}
            </div>

            {!chartMetrics.hasData ? (
              <div className="painel-chart-empty">Sem movimentacao financeira no periodo.</div>
            ) : null}
          </div>
        </section>

        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Lancar saida</h4>
              <p>Energia, funcionarios, reposicao e contas do dia a dia</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={salvarDespesa}>
            <label className="painel-field">
              <span>Titulo</span>
              <input
                value={formDespesa.titulo}
                onChange={(e) => setFormDespesa((prev) => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Conta de energia"
                required
              />
            </label>

            <label className="painel-field">
              <span>Categoria</span>
              <select
                value={formDespesa.categoria}
                onChange={(e) => setFormDespesa((prev) => ({ ...prev, categoria: e.target.value }))}
              >
                <option>Energia</option>
                <option>Funcionarios</option>
                <option>Produtos</option>
                <option>Aluguel</option>
                <option>Internet</option>
                <option>Marketing</option>
                <option>Outros</option>
              </select>
            </label>

            <label className="painel-field">
              <span>Valor</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formDespesa.valor}
                onChange={(e) => setFormDespesa((prev) => ({ ...prev, valor: e.target.value }))}
                placeholder="0,00"
                required
              />
            </label>

            <label className="painel-field">
              <span>Competencia</span>
              <input
                type="date"
                value={formDespesa.competencia}
                onChange={(e) => setFormDespesa((prev) => ({ ...prev, competencia: e.target.value }))}
              />
            </label>

            <label className="painel-field painel-field-full">
              <span>Observacoes</span>
              <textarea
                rows="4"
                value={formDespesa.observacoes}
                onChange={(e) => setFormDespesa((prev) => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Ex: parcela, fornecedor, repasse..."
              />
            </label>

            <div className="painel-form-actions">
              <button type="submit" className="painel-primary-button" disabled={salvandoDespesa}>
                {salvandoDespesa ? "Salvando..." : "Adicionar saida"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <div className="painel-grid painel-grid-secondary">
        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Agendamentos Recentes</h4>
              <p>Movimento do caixa e da agenda</p>
            </div>
          </div>

          <div className="painel-mini-list">
            {agendamentos.length > 0 ? (
              agendamentos.slice(0, 4).map((item) => (
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

        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Saidas Recentes</h4>
              <p>Contas e despesas registradas no caixa</p>
            </div>
          </div>

          <div className="painel-mini-list">
            {despesasRecentes.length > 0 ? (
              despesasRecentes.map((despesa) => (
                <div key={despesa.id} className="painel-mini-row">
                  <div>
                    <strong>{despesa.titulo}</strong>
                    <span>{despesa.categoria || "Sem categoria"}</span>
                  </div>
                  <div className="painel-table-actions">
                    <strong>{formatCurrency(despesa.valor)}</strong>
                    <button
                      type="button"
                      className="painel-table-btn is-danger-outline"
                      onClick={() => removerDespesaRapida(despesa.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhuma saida registrada.</div>
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
