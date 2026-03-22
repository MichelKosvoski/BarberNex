import { useEffect, useMemo, useState } from "react";
import {
  FiDollarSign,
  FiTrendingDown,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { getPainelBarbeariaId, getRelatoriosPainel } from "../../services/api";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PainelRelatorios() {
  const barbeariaId = getPainelBarbeariaId();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  async function carregarRelatorios() {
    try {
      setErro("");
      const resposta = await getRelatoriosPainel(barbeariaId);
      setDados(resposta);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const indicadoresApi = dados?.indicadores || {};
  const servicosTop = dados?.servicosTop || [];
  const barbeirosTop = dados?.barbeirosTop || [];
  const despesasCategorias = dados?.despesasCategorias || [];

  const insights = useMemo(() => {
    const lista = [];

    if (servicosTop[0]) {
      lista.push(`${servicosTop[0].nome} lidera em volume neste mes.`);
    }

    if (barbeirosTop[0]) {
      lista.push(`${barbeirosTop[0].nome} esta no topo da equipe em atendimentos.`);
    }

    if (despesasCategorias[0]) {
      lista.push(`${despesasCategorias[0].categoria} e a maior saida do periodo.`);
    }

    if (Number(indicadoresApi.crescimentoMensal || 0) > 0) {
      lista.push(`Crescimento de ${indicadoresApi.crescimentoMensal}% sobre o mes anterior.`);
    } else if (Number(indicadoresApi.crescimentoMensal || 0) < 0) {
      lista.push(`Queda de ${Math.abs(indicadoresApi.crescimentoMensal)}% sobre o mes anterior.`);
    }

    return lista;
  }, [servicosTop, barbeirosTop, despesasCategorias, indicadoresApi]);

  const cards = [
    {
      titulo: "Entradas do mes",
      valor: formatCurrency(indicadoresApi.entradasMes),
      detalhe: "Receita confirmada no periodo atual",
      destaque: "green",
      icon: FiDollarSign,
    },
    {
      titulo: "Saidas do mes",
      valor: formatCurrency(indicadoresApi.saidasMes),
      detalhe: "Despesas lancadas no caixa",
      destaque: "danger",
      icon: FiTrendingDown,
    },
    {
      titulo: "Lucro liquido",
      valor: formatCurrency(indicadoresApi.lucroLiquido),
      detalhe: "Entradas menos saidas do mes",
      destaque: Number(indicadoresApi.lucroLiquido || 0) >= 0 ? "gold" : "danger",
      icon: FiTrendingUp,
    },
    {
      titulo: "Ticket medio",
      valor: formatCurrency(indicadoresApi.ticketMedio),
      detalhe: `${individuais(indicadoresApi.atendimentosMes)} atendimento(s) confirmados`,
      destaque: "blue",
      icon: FiUsers,
    },
  ];

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Relatorios</p>
          <h3>Veja lucro, despesas e desempenho da equipe com leitura clara do mes.</h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-stats-grid">
        {cards.map((item) => {
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

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Comparativo do periodo</h4>
              <p>Resumo financeiro e comercial do mes atual</p>
            </div>
          </div>

          <div className="painel-info-stack">
            <div className="painel-info-pill">
              <span>Lucro bruto</span>
              <strong>{formatCurrency(indicadoresApi.lucroBruto)}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Clientes atendidos</span>
              <strong>{indicadoresApi.clientesMes ?? 0}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Crescimento mensal</span>
              <strong>{Number(indicadoresApi.crescimentoMensal || 0).toFixed(1)}%</strong>
            </div>
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Insights</h4>
              <p>Leituras rapidas para decisao</p>
            </div>
          </div>

          <div className="painel-tag-grid">
            {insights.length > 0 ? (
              insights.map((item) => (
                <span key={item} className="painel-tag">
                  {item}
                </span>
              ))
            ) : (
              <div className="painel-empty-state">Sem insights suficientes neste periodo.</div>
            )}
          </div>
        </article>
      </div>

      <div className="painel-grid painel-grid-secondary">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Servicos mais vendidos</h4>
              <p>Volume e receita do mes atual</p>
            </div>
          </div>

          <div className="painel-table-wrap">
            <table className="painel-table">
              <thead>
                <tr>
                  <th>Servico</th>
                  <th>Atendimentos</th>
                  <th>Receita</th>
                </tr>
              </thead>
              <tbody>
                {servicosTop.length > 0 ? (
                  servicosTop.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nome}</td>
                      <td>{item.quantidade}</td>
                      <td>{formatCurrency(item.receita)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="painel-empty-cell">
                      Sem servicos confirmados neste periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Despesas por categoria</h4>
              <p>Onde o caixa mais esta saindo</p>
            </div>
          </div>

          <div className="painel-mini-list">
            {despesasCategorias.length > 0 ? (
              despesasCategorias.map((item) => (
                <div key={item.categoria} className="painel-mini-row">
                  <div>
                    <strong>{item.categoria}</strong>
                    <span>Saida consolidada do periodo</span>
                  </div>
                  <strong>{formatCurrency(item.total)}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhuma despesa registrada neste periodo.</div>
            )}
          </div>
        </article>
      </div>

      <article className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Performance da equipe</h4>
            <p>Barbeiros com mais atendimentos no mes</p>
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
                  <span>{barbeiro.atendimentos} atendimento(s) no mes</span>
                </div>

                <strong className="painel-ranking-total">
                  {formatCurrency(barbeiro.receita)}
                </strong>
              </article>
            ))
          ) : (
            <div className="painel-empty-state">Nenhum barbeiro com movimento no periodo.</div>
          )}
        </div>
      </article>
    </section>
  );
}

function individuais(total) {
  return Number(total || 0);
}
