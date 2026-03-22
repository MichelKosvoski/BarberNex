import { useEffect, useMemo, useState } from "react";
import {
  createCliente,
  deleteCliente,
  getClientesPainel,
  getPainelBarbeariaId,
  updateCliente,
} from "../../services/api";

const initialForm = {
  nome: "",
  telefone: "",
  email: "",
  observacoes: "",
};

function normalizarTelefone(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export default function PainelClientes() {
  const barbeariaId = getPainelBarbeariaId();
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState(initialForm);

  async function carregarClientes() {
    try {
      setErro("");
      const data = await getClientesPainel(barbeariaId);
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    if (!busca.trim()) return clientes;
    const termo = busca.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.nome?.toLowerCase().includes(termo) ||
        cliente.telefone?.toLowerCase().includes(termo) ||
        cliente.email?.toLowerCase().includes(termo),
    );
  }, [busca, clientes]);

  const clientesComRetorno = clientes.filter(
    (cliente) => Number(cliente.total_agendamentos || 0) > 1,
  ).length;

  const clientesComWhatsapp = clientes.filter(
    (cliente) => normalizarTelefone(cliente.telefone).length >= 10,
  ).length;

  const resetForm = () => {
    setForm(initialForm);
    setEditandoId(null);
  };

  const preencherEdicao = (cliente) => {
    setEditandoId(cliente.id);
    setForm({
      nome: cliente.nome || "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      observacoes: cliente.observacoes || "",
    });
    setFeedback("");
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro("");
      setFeedback("");

      const payload = {
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        email: form.email.trim(),
        observacoes: form.observacoes.trim(),
      };

      if (editandoId) {
        await updateCliente(editandoId, payload);
        setFeedback("Cliente atualizado com sucesso.");
      } else {
        await createCliente(barbeariaId, payload);
        setFeedback("Cliente cadastrado com sucesso.");
      }

      resetForm();
      await carregarClientes();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const removerCliente = async (id) => {
    const confirmar = window.confirm("Deseja remover este cliente?");
    if (!confirmar) return;

    try {
      setErro("");
      setFeedback("");
      await deleteCliente(id);
      await carregarClientes();
      setFeedback("Cliente removido com sucesso.");
    } catch (error) {
      setErro(error.message);
    }
  };

  const enviarWhatsapp = (cliente) => {
    const telefone = normalizarTelefone(cliente.telefone);

    if (!telefone) {
      setErro("Esse cliente ainda nao tem telefone cadastrado.");
      return;
    }

    const mensagem = [
      `Ola, ${cliente.nome}.`,
      "Seu atendimento na barbearia esta sob controle.",
      "Se precisar remarcar ou confirmar, fale conosco por aqui.",
    ].join("\n");

    window.open(
      `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Clientes</p>
          <h3>Cadastre, organize e se relacione melhor com a base ativa da barbearia.</h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}
      {feedback ? <div className="painel-feedback">{feedback}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>{editandoId ? "Editar cliente" : "Novo cliente"}</h4>
              <p>Monte sua base para agenda, retorno e relacionamento.</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handleSubmit}>
            <label className="painel-field">
              <span>Nome</span>
              <input
                value={form.nome}
                onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Michel"
                required
              />
            </label>

            <label className="painel-field">
              <span>Telefone</span>
              <input
                value={form.telefone}
                onChange={(e) => setForm((prev) => ({ ...prev, telefone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </label>

            <label className="painel-field">
              <span>E-mail</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="cliente@email.com"
              />
            </label>

            <label className="painel-field painel-field-full">
              <span>Observacoes</span>
              <textarea
                rows="4"
                value={form.observacoes}
                onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Preferencias, tipo de corte, historico rapido..."
              />
            </label>

            <div className="painel-form-actions">
              {editandoId ? (
                <button type="button" className="painel-table-btn is-ghost" onClick={resetForm}>
                  Cancelar edicao
                </button>
              ) : null}
              <button type="submit" className="painel-primary-button" disabled={salvando}>
                {salvando
                  ? "Salvando..."
                  : editandoId
                    ? "Salvar cliente"
                    : "Cadastrar cliente"}
              </button>
            </div>
          </form>
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
              <strong>{clientes.length}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Com retorno</span>
              <strong>{clientesComRetorno}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Com WhatsApp</span>
              <strong>{clientesComWhatsapp}</strong>
            </div>
          </div>
        </article>
      </div>

      <article className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Base ativa</h4>
            <p>Clientes recorrentes com historico e acesso rapido.</p>
          </div>
          <input
            className="painel-inline-search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente..."
          />
        </div>

        <div className="painel-table-wrap">
          <table className="painel-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Retorno</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <strong>{cliente.nome}</strong>
                    </td>
                    <td>{cliente.telefone || "Sem telefone"}</td>
                    <td>{cliente.email || "Sem e-mail"}</td>
                    <td>{Number(cliente.total_agendamentos || 0)} agendamentos</td>
                    <td>
                      <div className="painel-table-actions">
                        <button
                          type="button"
                          className="painel-table-btn is-whatsapp"
                          onClick={() => enviarWhatsapp(cliente)}
                        >
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-ghost"
                          onClick={() => preencherEdicao(cliente)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-danger-outline"
                          onClick={() => removerCliente(cliente.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="painel-empty-cell">
                    Nenhum cliente encontrado.
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
