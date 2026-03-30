import { useEffect, useMemo, useState } from "react";
import {
  createMasterCheckout,
  createMasterCobranca,
  deleteMasterCobranca,
  getMasterBarbearias,
  getMasterCobrancas,
  getMasterPlanos,
  updateMasterCobranca,
} from "../../services/api";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value) {
  if (!value) return "--";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "atrasado", label: "Atrasado" },
  { value: "cancelado", label: "Cancelado" },
];

const metodoOptions = [
  { value: "manual", label: "Manual" },
  { value: "mercado_pago", label: "Mercado Pago" },
  { value: "pix", label: "Pix" },
  { value: "boleto", label: "Boleto" },
  { value: "cartao", label: "Cartao" },
];

const emptyForm = {
  barbearia_id: "",
  descricao: "",
  plano: "",
  plano_id: "",
  plano_codigo: "",
  referencia: "",
  valor: "",
  status: "pendente",
  metodo: "manual",
  vencimento: "",
  checkout_url: "",
  observacoes: "",
};

function getStatusClass(status) {
  if (status === "pago") return "is-finalizado";
  if (status === "atrasado") return "is-cancelado";
  if (status === "cancelado") return "is-danger";
  return "is-agendado";
}

export default function MasterPagamentos() {
  const [barbearias, setBarbearias] = useState([]);
  const [planoOptions, setPlanoOptions] = useState([]);
  const [cobrancas, setCobrancas] = useState([]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    barbearia_id: "",
  });
  const [form, setForm] = useState(emptyForm);

  async function carregar() {
    try {
      setErro("");
      const [listaBarbearias, listaCobrancas, listaPlanos] = await Promise.all([
        getMasterBarbearias(),
        getMasterCobrancas(filters),
        getMasterPlanos(),
      ]);
      setBarbearias(listaBarbearias);
      setCobrancas(listaCobrancas);
      setPlanoOptions(Array.isArray(listaPlanos) ? listaPlanos : []);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregar();
    const intervalId = setInterval(carregar, 12000);

    return () => clearInterval(intervalId);
  }, [filters.search, filters.status, filters.barbearia_id]);

  const resumo = useMemo(() => {
    const pendentes = cobrancas.filter((item) => item.status === "pendente");
    const pagas = cobrancas.filter((item) => item.status === "pago");
    const atrasadas = cobrancas.filter((item) => item.status === "atrasado");
    const totalAberto = cobrancas
      .filter((item) => item.status === "pendente" || item.status === "atrasado")
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);

    return {
      pendentes: pendentes.length,
      pagas: pagas.length,
      atrasadas: atrasadas.length,
      totalAberto,
    };
  }, [cobrancas]);

  function handlePlanoChange(value) {
    const planoSelecionado = planoOptions.find((item) => String(item.id) === String(value));

    setForm((prev) => ({
      ...prev,
      plano: planoSelecionado?.nome || "",
      plano_id: value,
      plano_codigo: planoSelecionado?.codigo || "",
      valor: value === "" ? "" : planoSelecionado ? String(planoSelecionado.valor_mensal) : prev.valor,
      descricao: prev.descricao || (planoSelecionado ? planoSelecionado.descricao : ""),
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function fillForm(item) {
    setEditingId(item.id);
    setForm({
      barbearia_id: String(item.barbearia_id || ""),
      descricao: item.descricao || "",
      plano: item.plano || "",
      plano_id: item.plano_id ? String(item.plano_id) : "",
      plano_codigo: item.plano_codigo || "",
      referencia: item.referencia || "",
      valor: String(item.valor || ""),
      status: item.status || "pendente",
      metodo: item.metodo || "manual",
      vencimento: item.vencimento ? String(item.vencimento).slice(0, 10) : "",
      checkout_url: item.checkout_url || "",
      observacoes: item.observacoes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      const payload = {
        ...form,
        barbearia_id: Number(form.barbearia_id),
        plano_id: form.plano_id ? Number(form.plano_id) : null,
        valor: Number(form.valor || 0),
      };

      if (editingId) {
        await updateMasterCobranca(editingId, payload);
      } else {
        await createMasterCobranca(payload);
      }

      resetForm();
      await carregar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleQuickStatus(item, status) {
    try {
      setErro("");
      await updateMasterCobranca(item.id, {
        status,
        valor: item.valor,
      });
      await carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Remover esta cobranca?");
    if (!confirmed) return;

    try {
      setErro("");
      await deleteMasterCobranca(id);
      if (editingId === id) resetForm();
      await carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  async function handleGenerateCheckout(item) {
    try {
      setErro("");
      await createMasterCheckout(item.id);
      await carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Cobrancas da plataforma</p>
          <h3>Crie cobrancas, acompanhe vencimentos e libere a barbearia manualmente enquanto o checkout automatico nao entra.</h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-stats-grid painel-stats-grid-4">
        <article className="painel-stat-card painel-accent-gold">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Pendentes</span>
          </div>
          <strong className="painel-stat-value">{resumo.pendentes}</strong>
          <p className="painel-stat-detail">Ainda aguardando pagamento.</p>
        </article>

        <article className="painel-stat-card painel-accent-green">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Pagas</span>
          </div>
          <strong className="painel-stat-value">{resumo.pagas}</strong>
          <p className="painel-stat-detail">Cobrancas liquidadas.</p>
        </article>

        <article className="painel-stat-card painel-accent-danger">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Atrasadas</span>
          </div>
          <strong className="painel-stat-value">{resumo.atrasadas}</strong>
          <p className="painel-stat-detail">Precisam de acao comercial.</p>
        </article>

        <article className="painel-stat-card painel-accent-blue">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Em aberto</span>
          </div>
          <strong className="painel-stat-value">{formatCurrency(resumo.totalAberto)}</strong>
          <p className="painel-stat-detail">Pendentes + atrasadas.</p>
        </article>
      </div>

      <div className="painel-grid painel-grid-main">
        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>{editingId ? "Editar cobranca" : "Nova cobranca"}</h4>
              <p>Monte a cobranca manual agora e deixe o checkout pronto para depois.</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handleSubmit}>
            <select
              value={form.barbearia_id}
              onChange={(event) => setForm((prev) => ({ ...prev, barbearia_id: event.target.value }))}
              required
            >
              <option value="">Selecione a barbearia</option>
              {barbearias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome} {item.estado ? `- ${item.estado}` : ""}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Descricao da cobranca"
              value={form.descricao}
              onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
              required
            />

              <select
                value={form.plano_id}
                onChange={(event) => handlePlanoChange(event.target.value)}
              >
                <option value="">Sem plano</option>
                {planoOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome} - {formatCurrency(item.valor_mensal)}
                  </option>
                ))}
              </select>

            <input
              type="text"
              placeholder="Referencia ex: Mar/2026"
              value={form.referencia}
              onChange={(event) => setForm((prev) => ({ ...prev, referencia: event.target.value }))}
            />

            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Valor"
              value={form.valor}
              onChange={(event) => setForm((prev) => ({ ...prev, valor: event.target.value }))}
              required
            />

            <input
              type="date"
              value={form.vencimento}
              onChange={(event) => setForm((prev) => ({ ...prev, vencimento: event.target.value }))}
            />

            <select
              value={form.metodo}
              onChange={(event) => setForm((prev) => ({ ...prev, metodo: event.target.value }))}
            >
              {metodoOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              {statusOptions
                .filter((item) => item.value)
                .map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
            </select>

            <input
              type="url"
              placeholder="Checkout URL do Mercado Pago (opcional)"
              value={form.checkout_url}
              onChange={(event) => setForm((prev) => ({ ...prev, checkout_url: event.target.value }))}
            />

            <textarea
              placeholder="Observacoes internas"
              value={form.observacoes}
              onChange={(event) => setForm((prev) => ({ ...prev, observacoes: event.target.value }))}
            />

            <div className="painel-form-actions">
              {editingId ? (
                <button type="button" className="painel-secondary-button" onClick={resetForm}>
                  Cancelar edicao
                </button>
              ) : null}
              <button type="submit" className="painel-primary-button" disabled={salvando}>
                {salvando ? "Salvando..." : editingId ? "Salvar cobranca" : "Criar cobranca"}
              </button>
            </div>
          </form>
        </section>

        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Filtros</h4>
              <p>Encontre cobrancas por status, barbearia ou texto livre.</p>
            </div>
          </div>

          <div className="painel-form-grid">
            <input
              type="text"
              placeholder="Buscar por barbearia, plano ou descricao"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />

            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              {statusOptions.map((item) => (
                <option key={item.value || "all"} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={filters.barbearia_id}
              onChange={(event) => setFilters((prev) => ({ ...prev, barbearia_id: event.target.value }))}
            >
              <option value="">Todas as barbearias</option>
              {barbearias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>

            <div className="painel-total-box">
              <span>Total listado</span>
              <strong>{cobrancas.length}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Historico de cobrancas</h4>
            <p>Controle manual agora e transicao para checkout automatico depois.</p>
          </div>
        </div>

        <div className="painel-table-wrap">
          <table className="painel-table">
            <thead>
              <tr>
                <th>Barbearia</th>
                <th>Descricao</th>
                <th>Vencimento</th>
                <th>Metodo</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {cobrancas.length > 0 ? (
                cobrancas.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.barbearia_nome}</strong>
                      <div className="painel-table-subcopy">
                        {item.barbearia_cidade || "Cidade"} - {item.barbearia_estado || "--"}
                      </div>
                    </td>
                    <td>
                      <strong>{item.descricao}</strong>
                      <div className="painel-table-subcopy">
                        {item.plano || "Sem plano"} {item.referencia ? `• ${item.referencia}` : ""}
                      </div>
                    </td>
                    <td>{formatDate(item.vencimento)}</td>
                    <td>{item.metodo || "manual"}</td>
                    <td>
                      <span className={`painel-status-badge ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatCurrency(item.valor)}</td>
                    <td>
                      <div className="painel-table-actions">
                        <button type="button" className="painel-table-btn is-ghost" onClick={() => fillForm(item)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-whatsapp"
                          onClick={() => handleGenerateCheckout(item)}
                        >
                          Gerar checkout
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-confirm"
                          onClick={() => handleQuickStatus(item, "pago")}
                        >
                          Pago
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-danger-outline"
                          onClick={() => handleQuickStatus(item, "atrasado")}
                        >
                          Atrasado
                        </button>
                        {item.checkout_url ? (
                          <a
                            className="painel-table-btn is-whatsapp"
                            href={item.checkout_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Checkout
                          </a>
                        ) : null}
                        <button
                          type="button"
                          className="painel-table-btn is-danger"
                          onClick={() => handleDelete(item.id)}
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
                    Nenhuma cobranca cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
