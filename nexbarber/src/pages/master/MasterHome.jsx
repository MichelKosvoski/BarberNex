import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowUpRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiCreditCard,
  FiMapPin,
  FiTrendingUp,
} from "react-icons/fi";
import { getMasterResumo } from "../../services/api";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateLabel(value) {
  if (!value) return "--/--/----";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

const periodOptions = [
  { value: "1m", label: "1 mes" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "12m", label: "12 meses" },
  { value: "24m", label: "24 meses" },
];

function buildChartPath(values, width, height) {
  if (!values.length) return "";

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function Chart({ data }) {
  const width = 760;
  const height = 240;
  const values = data.map((item) => Number(item.receita || 0));
  const hasData = values.some((value) => value !== 0);
  const path = buildChartPath(values, width, height);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const zeroY = height - ((0 - min) / range) * height;

  return (
    <div className={`painel-chart-shell ${hasData ? "" : "is-empty"}`}>
      <svg className="painel-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <line
          x1="0"
          x2={width}
          y1={zeroY}
          y2={zeroY}
          className="painel-chart-zero-line"
        />
        {hasData ? (
          <path
            d={path}
            fill="none"
            stroke="url(#masterChartGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            className="painel-chart-line"
          />
        ) : null}
        <defs>
          <linearGradient id="masterChartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6ca8ff" />
            <stop offset="55%" stopColor="#75f0af" />
            <stop offset="100%" stopColor="#f6c445" />
          </linearGradient>
        </defs>
      </svg>

      <div className="painel-chart-labels">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>

      {!hasData ? <div className="painel-chart-empty">Sem faturamento no periodo selecionado.</div> : null}
    </div>
  );
}

export default function MasterHome() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [filtros, setFiltros] = useState({
    periodo: "12m",
    estado: "",
    cidade: "",
    dataInicio: "",
    dataFim: "",
  });

  useEffect(() => {
    async function carregar() {
      try {
        setErro("");
        const resposta = await getMasterResumo(filtros);
        setDados(resposta);
      } catch (error) {
        setErro(error.message);
      }
    }

    carregar();
  }, [filtros]);

  const cidadesDisponiveis = useMemo(() => dados?.filtros?.cidades || [], [dados]);

  const indicadores = [
    {
      titulo: "Barbearias filtradas",
      valor: dados?.indicadores?.totalBarbearias ?? 0,
      detalhe: "Base no recorte atual",
      destaque: "blue",
      icon: FiBriefcase,
    },
    {
      titulo: "Ativas",
      valor: dados?.indicadores?.barbeariasAtivas ?? 0,
      detalhe: "Com acesso liberado",
      destaque: "green",
      icon: FiCheckCircle,
    },
    {
      titulo: "Pagamentos pendentes",
      valor: dados?.indicadores?.pagamentosPendentes ?? 0,
      detalhe: "Cobranca em aberto",
      destaque: "danger",
      icon: FiAlertTriangle,
    },
    {
      titulo: "Faturamento no periodo",
      valor: formatCurrency(dados?.indicadores?.faturamentoPeriodo),
      detalhe: "Mensalidades pagas no intervalo",
      destaque: "gold",
      icon: FiCreditCard,
    },
    {
      titulo: "Media mensal",
      valor: formatCurrency(dados?.indicadores?.mediaMensalPeriodo),
      detalhe: "Media por mes do filtro",
      destaque: "default",
      icon: FiTrendingUp,
    },
    {
      titulo: "Receita prevista",
      valor: formatCurrency(dados?.indicadores?.receitaMensalPrevista),
      detalhe: "Mensalidade ativa atual",
      destaque: "default",
      icon: FiActivity,
    },
  ];

  const filtroManualAtivo = Boolean(filtros.dataInicio || filtros.dataFim);
  const periodoSelecionadoLabel =
    periodOptions.find((item) => item.value === filtros.periodo)?.label || "12 meses";

  return (
    <section className="painel-content">
      <div className="painel-hero">
        <div>
          <p className="painel-eyebrow">Painel master</p>
          <h3>Analise faturamento, pagamento e desempenho da plataforma por estado, cidade e periodo.</h3>
        </div>

        <Link to="/master/barbearias" className="painel-primary-button">
          Ver barbearias
          <FiArrowUpRight />
        </Link>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <section className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Filtro avancado do dashboard</h4>
            <p>Use atalhos rapidos ou selecione manualmente o intervalo exato que quer somar.</p>
          </div>
        </div>

        <div className="painel-master-filter-bar">
          <div className="painel-master-filter-row">
            <div className="painel-filter-section">
              <div className="painel-filter-section-head">
                <strong>Periodo rapido</strong>
                <span>Mantem atalhos prontos sem perder o filtro manual.</span>
              </div>

              <div className="painel-period-chips">
                {periodOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`painel-period-chip ${
                      filtros.periodo === item.value && !filtroManualAtivo ? "is-active" : ""
                    }`}
                    onClick={() =>
                      setFiltros((prev) => ({
                        ...prev,
                        periodo: item.value,
                        dataInicio: "",
                        dataFim: "",
                      }))
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="painel-filter-section">
              <div className="painel-filter-section-head">
                <strong>Intervalo manual</strong>
                <span>
                  <FiCalendar />
                  Exemplo: 01/10/2025 ate 22/03/2026.
                </span>
              </div>

              <div className="painel-date-toolbar">
                <label className="painel-date-field">
                  <span>Data inicial</span>
                  <input
                    type="date"
                    className="painel-search"
                    value={filtros.dataInicio}
                    onChange={(event) =>
                      setFiltros((prev) => ({
                        ...prev,
                        dataInicio: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="painel-date-field">
                  <span>Data final</span>
                  <input
                    type="date"
                    className="painel-search"
                    value={filtros.dataFim}
                    onChange={(event) =>
                      setFiltros((prev) => ({
                        ...prev,
                        dataFim: event.target.value,
                      }))
                    }
                  />
                </label>

                <button
                  type="button"
                  className="painel-filter-chip"
                  onClick={() =>
                    setFiltros((prev) => ({
                      ...prev,
                      dataInicio: "",
                      dataFim: "",
                    }))
                  }
                >
                  Limpar intervalo
                </button>
              </div>

              <div className="painel-filter-inline-status">
                <span className={`painel-filter-mode ${filtroManualAtivo ? "is-active" : ""}`}>
                  {filtroManualAtivo
                    ? `Manual: ${formatDateLabel(filtros.dataInicio)} ate ${formatDateLabel(filtros.dataFim)}`
                    : `Rapido: ${periodoSelecionadoLabel}`}
                </span>
                <small>
                  {filtroManualAtivo
                    ? "O dashboard esta somando apenas o intervalo manual informado."
                    : "Sem datas manuais, o painel usa o periodo rapido selecionado."}
                </small>
              </div>
            </div>
          </div>

          <div className="painel-master-filter-row is-compact">
            <div className="painel-filter-section">
              <div className="painel-filter-section-head">
                <strong>Recorte geografico</strong>
                <span>
                  <FiMapPin />
                  Estado fixo e cidades dinamicas conforme os cadastros.
                </span>
              </div>

              <div className="painel-table-toolbar is-master-filters">
                <select
                  className="painel-toolbar-select"
                  value={filtros.estado}
                  onChange={(event) =>
                    setFiltros((prev) => ({ ...prev, estado: event.target.value, cidade: "" }))
                  }
                >
                  <option value="">Todos os estados</option>
                  {(dados?.filtros?.estados || []).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  className="painel-toolbar-select"
                  value={filtros.cidade}
                  onChange={(event) =>
                    setFiltros((prev) => ({ ...prev, cidade: event.target.value }))
                  }
                >
                  <option value="">Todas as cidades</option>
                  {cidadesDisponiveis.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

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
        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Faturamento por periodo</h4>
              <p>Leitura mensal do recorte selecionado.</p>
            </div>
            <div className="painel-header-tools">
              <span className="painel-filter-chip">
                {filtroManualAtivo
                  ? `${formatDateLabel(filtros.dataInicio)} ate ${formatDateLabel(filtros.dataFim)}`
                  : periodoSelecionadoLabel}
              </span>
            </div>
          </div>

          <Chart data={dados?.graficoFaturamento || []} />
        </section>

        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Pendencias por estado</h4>
              <p>Onde a cobranca pede mais atencao.</p>
            </div>
          </div>

          <div className="painel-mini-list">
            {(dados?.pendenciasPorEstado || []).length > 0 ? (
              dados.pendenciasPorEstado.map((item) => (
                <div key={item.estado} className="painel-mini-row">
                  <div>
                    <strong>{item.estado}</strong>
                    <span>Pagamentos pendentes ou atrasados</span>
                  </div>
                  <strong>{item.total}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhuma pendencia encontrada.</div>
            )}
          </div>
        </section>
      </div>

      <div className="painel-grid painel-grid-main">
        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Distribuicao de planos</h4>
              <p>Visao rapida dos contratos no recorte atual.</p>
            </div>
          </div>

          <div className="painel-mini-list">
            {(dados?.distribuicaoPlanos || []).length > 0 ? (
              dados.distribuicaoPlanos.map((item) => (
                <div key={item.plano} className="painel-mini-row">
                  <div>
                    <strong>{item.plano}</strong>
                    <span>Barbearias nesse plano</span>
                  </div>
                  <strong>{item.total}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum plano encontrado.</div>
            )}
          </div>
        </section>

        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Ultimas barbearias</h4>
              <p>Entradas mais recentes dentro do recorte escolhido.</p>
            </div>
          </div>

          <div className="painel-mini-list">
            {(dados?.ultimasBarbearias || []).length > 0 ? (
              dados.ultimasBarbearias.map((item) => (
                <div key={item.id} className="painel-mini-row">
                  <div>
                    <strong>{item.nome}</strong>
                    <span>
                      <FiMapPin /> {item.cidade || "Cidade"} - {item.estado || "--"} • {item.plano || "Sem plano"}
                    </span>
                  </div>
                  <strong>{item.status_assinatura || "pendente"}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhuma barbearia encontrada.</div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
