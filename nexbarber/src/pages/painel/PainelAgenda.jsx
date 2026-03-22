import { useEffect, useMemo, useState } from "react";
import {
  deleteAgendamento,
  getAgendamentosPainel,
  getBarbeirosPainel,
  getPainelBarbeariaId,
  getServicosPainel,
  updateAgendamento,
  updateAgendamentoStatus,
} from "../../services/api";

function contarStatus(lista, status) {
  return lista.filter((item) => item.status === status).length;
}

function formatarHora(hora) {
  return String(hora || "").slice(0, 5);
}

function formatarData(data) {
  if (!data) return "--";
  const value = new Date(data);
  return Number.isNaN(value.getTime())
    ? String(data)
    : value.toLocaleDateString("pt-BR");
}

function badgeClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "confirmado") return "is-confirmado";
  if (normalized === "finalizado") return "is-finalizado";
  if (normalized === "cancelado") return "is-cancelado";
  return "is-agendado";
}

function normalizarTelefone(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export default function PainelAgenda() {
  const barbeariaId = getPainelBarbeariaId();
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [editorAberto, setEditorAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    barbeiro_id: "",
    servico_id: "",
    data: "",
    hora: "",
    status: "agendado",
    observacao: "",
  });

  async function carregarAgenda() {
    try {
      setLoading(true);
      setErro("");
      const [agendaData, barbeirosData, servicosData] = await Promise.all([
        getAgendamentosPainel(barbeariaId),
        getBarbeirosPainel(barbeariaId),
        getServicosPainel(barbeariaId),
      ]);

      setAgendamentos(Array.isArray(agendaData) ? agendaData : []);
      setBarbeiros(Array.isArray(barbeirosData) ? barbeirosData : []);
      setServicos(Array.isArray(servicosData) ? servicosData : []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAgenda();
  }, []);

  const proximoAtendimento = useMemo(() => {
    const agora = new Date();
    const futuros = agendamentos
      .filter((item) => item.status !== "cancelado" && item.status !== "finalizado")
      .map((item) => {
        const dateTime = new Date(`${item.data}T${formatarHora(item.hora)}:00`);
        return { ...item, dateTime };
      })
      .filter((item) => !Number.isNaN(item.dateTime.getTime()) && item.dateTime >= agora)
      .sort((a, b) => a.dateTime - b.dateTime);

    return futuros[0] || null;
  }, [agendamentos]);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((item) => {
      const bateStatus = filtroStatus === "todos" || item.status === filtroStatus;
      const termo = busca.trim().toLowerCase();
      const bateBusca =
        !termo ||
        item.cliente_nome?.toLowerCase().includes(termo) ||
        item.barbeiro_nome?.toLowerCase().includes(termo) ||
        item.servico_nome?.toLowerCase().includes(termo) ||
        formatarHora(item.hora).includes(termo);

      return bateStatus && bateBusca;
    });
  }, [agendamentos, busca, filtroStatus]);

  const abrirEditor = (item) => {
    setEditandoId(item.id);
    setForm({
      barbeiro_id: String(item.barbeiro_id || ""),
      servico_id: String(item.servico_id || ""),
      data: String(item.data || "").slice(0, 10),
      hora: formatarHora(item.hora),
      status: item.status || "agendado",
      observacao: item.observacao || "",
    });
    setEditorAberto(true);
    setFeedback("");
  };

  const fecharEditor = () => {
    setEditorAberto(false);
    setEditandoId(null);
    setForm({
      barbeiro_id: "",
      servico_id: "",
      data: "",
      hora: "",
      status: "agendado",
      observacao: "",
    });
  };

  const atualizarStatus = async (id, status) => {
    try {
      setFeedback("");
      await updateAgendamentoStatus(id, status);
      await carregarAgenda();
      setFeedback(`Agendamento atualizado para ${status}.`);
    } catch (error) {
      setErro(error.message);
    }
  };

  const removerAgendamento = async (id) => {
    const confirmar = window.confirm("Deseja remover este agendamento?");
    if (!confirmar) return;

    try {
      setFeedback("");
      await deleteAgendamento(id);
      await carregarAgenda();
      setFeedback("Agendamento removido com sucesso.");
    } catch (error) {
      setErro(error.message);
    }
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro("");
      await updateAgendamento(editandoId, {
        barbeiro_id: Number(form.barbeiro_id),
        servico_id: Number(form.servico_id),
        data: form.data,
        hora: form.hora,
        status: form.status,
        observacao: form.observacao,
      });
      await carregarAgenda();
      fecharEditor();
      setFeedback("Agendamento remarcado/atualizado com sucesso.");
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const enviarWhatsappBarbeiro = (item) => {
    const telefone = normalizarTelefone(item.barbeiro_telefone);

    if (!telefone) {
      setErro("Esse barbeiro ainda nao tem telefone cadastrado.");
      return;
    }

    const mensagem = [
      `Ola, ${item.barbeiro_nome}.`,
      `Voce tem um atendimento na ${item.data ? formatarData(item.data) : "--"} as ${formatarHora(item.hora)}.`,
      `Cliente: ${item.cliente_nome}`,
      `Servico: ${item.servico_nome}`,
      item.observacao ? `Observacao: ${item.observacao}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const enviarWhatsappCliente = (item) => {
    const telefone = normalizarTelefone(item.cliente_telefone);

    if (!telefone) {
      setErro("Esse cliente ainda nao tem telefone cadastrado.");
      return;
    }

    const mensagem = [
      `Ola, ${item.cliente_nome}.`,
      `Seu atendimento esta agendado para ${formatarData(item.data)} as ${formatarHora(item.hora)}.`,
      `Servico: ${item.servico_nome}`,
      `Barbeiro: ${item.barbeiro_nome}`,
      "Se precisar remarcar, responda esta mensagem.",
    ].join("\n");

    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Agenda</p>
          <h3>Controle os atendimentos do dia, encaixes, remarcacoes e cancelamentos.</h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}
      {feedback ? <div className="painel-feedback">{feedback}</div> : null}

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
          <div className="painel-header-tools">
            {proximoAtendimento ? (
              <div className="painel-next-chip">
                Proximo: {proximoAtendimento.cliente_nome} as {formatarHora(proximoAtendimento.hora)}
              </div>
            ) : null}
            <input
              className="painel-inline-search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente, servico..."
            />
            <select
              className="painel-inline-select"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="painel-table-wrap">
          <table className="painel-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horario</th>
                <th>Cliente</th>
                <th>Servico</th>
                <th>Barbeiro</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {agendamentosFiltrados.length > 0 ? (
                agendamentosFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td>{formatarData(item.data)}</td>
                    <td>{formatarHora(item.hora)}</td>
                    <td>{item.cliente_nome}</td>
                    <td>{item.servico_nome}</td>
                    <td>{item.barbeiro_nome}</td>
                    <td>
                      <span className={`painel-status-badge ${badgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="painel-table-actions">
                        <button
                          type="button"
                          className="painel-table-btn is-ghost"
                          onClick={() => abrirEditor(item)}
                        >
                          Remarcar
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-whatsapp"
                          onClick={() => enviarWhatsappCliente(item)}
                        >
                          Cliente
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-whatsapp"
                          onClick={() => enviarWhatsappBarbeiro(item)}
                        >
                          Barbeiro
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-confirm"
                          onClick={() => atualizarStatus(item.id, "confirmado")}
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-neutral"
                          onClick={() => atualizarStatus(item.id, "finalizado")}
                        >
                          Finalizar
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-danger"
                          onClick={() => atualizarStatus(item.id, "cancelado")}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-danger-outline"
                          onClick={() => removerAgendamento(item.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="painel-empty-cell">
                    {loading ? "Carregando agendamentos..." : "Nenhum agendamento encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {editorAberto ? (
        <div className="painel-modal-overlay" onClick={fecharEditor}>
          <div className="painel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="painel-card-header">
              <div>
                <h4>Editar agendamento</h4>
                <p>Remarque, troque o barbeiro ou ajuste o status.</p>
              </div>
              <button type="button" className="painel-table-btn is-ghost" onClick={fecharEditor}>
                Fechar
              </button>
            </div>

            <form className="painel-form-grid" onSubmit={salvarEdicao}>
              <label className="painel-field">
                <span>Data</span>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((prev) => ({ ...prev, data: e.target.value }))}
                  required
                />
              </label>

              <label className="painel-field">
                <span>Horario</span>
                <input
                  type="time"
                  value={form.hora}
                  onChange={(e) => setForm((prev) => ({ ...prev, hora: e.target.value }))}
                  required
                />
              </label>

              <label className="painel-field">
                <span>Servico</span>
                <select
                  value={form.servico_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, servico_id: e.target.value }))}
                  required
                >
                  <option value="">Selecione</option>
                  {servicos.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="painel-field">
                <span>Barbeiro</span>
                <select
                  value={form.barbeiro_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, barbeiro_id: e.target.value }))}
                  required
                >
                  <option value="">Selecione</option>
                  {barbeiros.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="painel-field">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="agendado">Agendado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>

              <label className="painel-field painel-field-full">
                <span>Observacao</span>
                <textarea
                  rows="4"
                  value={form.observacao}
                  onChange={(e) => setForm((prev) => ({ ...prev, observacao: e.target.value }))}
                  placeholder="Anotacoes internas ou recados do cliente..."
                />
              </label>

              <div className="painel-form-actions">
                <button type="button" className="painel-table-btn is-ghost" onClick={fecharEditor}>
                  Cancelar
                </button>
                <button type="submit" className="painel-primary-button" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
