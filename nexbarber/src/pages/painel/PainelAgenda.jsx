import { useEffect, useState } from "react";
import { getAgendamentosPainel, getPainelBarbeariaId } from "../../services/api";

function contarStatus(lista, status) {
  return lista.filter((item) => item.status === status).length;
}

export default function PainelAgenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const barbeariaId = getPainelBarbeariaId();

    async function carregarAgendamentos() {
      try {
        const data = await getAgendamentosPainel(barbeariaId);
        setAgendamentos(data);
      } catch (error) {
        setErro(error.message);
      }
    }

    carregarAgendamentos();
  }, []);

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Agenda</p>
          <h3>Controle os atendimentos do dia, encaixes e confirmacoes.</h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

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
              <strong>{agendamentos.length}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Confirmados</span>
              <strong>{contarStatus(agendamentos, "confirmado")}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Finalizados</span>
              <strong>{contarStatus(agendamentos, "finalizado")}</strong>
            </div>
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Status do dia</h4>
              <p>Leitura rapida da agenda</p>
            </div>
          </div>

          <div className="painel-tag-grid">
            <span className="painel-tag">Agendado: {contarStatus(agendamentos, "agendado")}</span>
            <span className="painel-tag">Confirmado: {contarStatus(agendamentos, "confirmado")}</span>
            <span className="painel-tag">Finalizado: {contarStatus(agendamentos, "finalizado")}</span>
            <span className="painel-tag">Cancelado: {contarStatus(agendamentos, "cancelado")}</span>
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
                <th>Horario</th>
                <th>Cliente</th>
                <th>Servico</th>
                <th>Barbeiro</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.length > 0 ? (
                agendamentos.map((item) => (
                  <tr key={item.id}>
                    <td>{String(item.hora).slice(0, 5)}</td>
                    <td>{item.cliente_nome}</td>
                    <td>{item.servico_nome}</td>
                    <td>{item.barbeiro_nome}</td>
                    <td>{item.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="painel-empty-cell">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
