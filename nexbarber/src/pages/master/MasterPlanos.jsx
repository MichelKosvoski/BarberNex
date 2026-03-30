import { useEffect, useMemo, useState } from "react";
import {
  createMasterPlano,
  deleteMasterPlano,
  getMasterPlanos,
  updateMasterPlano,
} from "../../services/api";

const initialForm = {
  codigo: "",
  nome: "",
  descricao: "",
  destaque: "",
  valor_mensal: "",
  beneficios: "",
  escopo: "completo",
  premium: false,
  ordem: "0",
  status: "ativo",
};

function beneficiosToTextarea(beneficios) {
  if (Array.isArray(beneficios)) {
    return beneficios.join("\n");
  }

  return "";
}

export default function MasterPlanos() {
  const [planos, setPlanos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const resposta = await getMasterPlanos();
      setPlanos(Array.isArray(resposta) ? resposta : []);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const resumo = useMemo(
    () => ({
      total: planos.length,
      ativos: planos.filter((item) => item.status === "ativo").length,
      premium: planos.filter((item) => item.premium).length,
      basicos: planos.filter((item) => item.escopo === "basico").length,
    }),
    [planos],
  );

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function fillForm(plano) {
    setErro("");
    setFeedback("");
    setEditingId(plano.id);
    setForm({
      codigo: plano.codigo || "",
      nome: plano.nome || "",
      descricao: plano.descricao || "",
      destaque: plano.destaque || "",
      valor_mensal: String(plano.valor_mensal || ""),
      beneficios: beneficiosToTextarea(plano.beneficios),
      escopo: plano.escopo || "completo",
      premium: Boolean(plano.premium),
      ordem: String(plano.ordem || 0),
      status: plano.status || "ativo",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setErro("");
      setFeedback("");
      setSalvando(true);

      const payload = {
        ...form,
        codigo: form.codigo.trim().toLowerCase(),
        valor_mensal: Number(form.valor_mensal || 0),
        ordem: Number(form.ordem || 0),
      };

      if (editingId) {
        await updateMasterPlano(editingId, payload);
        setFeedback("Plano atualizado com sucesso.");
      } else {
        await createMasterPlano(payload);
        setFeedback("Plano criado com sucesso.");
      }

      resetForm();
      await carregar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Deseja excluir este plano?");
    if (!confirmed) return;

    try {
      setErro("");
      setFeedback("");
      await deleteMasterPlano(id);
      if (editingId === id) resetForm();
      setFeedback("Plano removido com sucesso.");
      await carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Planos da plataforma</p>
          <h3>
            Cadastre, altere e remova os planos comerciais do NexBarber em um
            lugar so. A landing e o master passam a ler dessa mesma base.
          </h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}
      {feedback ? <div className="painel-feedback">{feedback}</div> : null}

      <div className="painel-stats-grid painel-stats-grid-4">
        <article className="painel-stat-card painel-accent-blue">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Total</span>
          </div>
          <strong className="painel-stat-value">{resumo.total}</strong>
          <p className="painel-stat-detail">Planos cadastrados</p>
        </article>

        <article className="painel-stat-card painel-accent-green">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Ativos</span>
          </div>
          <strong className="painel-stat-value">{resumo.ativos}</strong>
          <p className="painel-stat-detail">Exibidos e disponiveis</p>
        </article>

        <article className="painel-stat-card painel-accent-gold">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Premium</span>
          </div>
          <strong className="painel-stat-value">{resumo.premium}</strong>
          <p className="painel-stat-detail">Com destaque comercial</p>
        </article>

        <article className="painel-stat-card painel-accent-default">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Basicos</span>
          </div>
          <strong className="painel-stat-value">{resumo.basicos}</strong>
          <p className="painel-stat-detail">Com acesso reduzido</p>
        </article>
      </div>

      <div className="painel-grid painel-grid-main">
        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>{editingId ? "Editar plano" : "Novo plano"}</h4>
              <p>Defina nome, preco, beneficios e comportamento do sistema</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handleSubmit}>
            <label className="painel-field">
              <span>Codigo interno</span>
              <input
                value={form.codigo}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, codigo: event.target.value }))
                }
                placeholder="ex: agenda, completo, premium"
              />
              <small className="painel-field-help">
                Esse codigo identifica o plano no sistema.
              </small>
            </label>

            <label className="painel-field">
              <span>Nome exibido</span>
              <input
                value={form.nome}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nome: event.target.value }))
                }
                placeholder="Ex: Prata"
              />
            </label>

            <label className="painel-field">
              <span>Preco mensal base</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valor_mensal}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, valor_mensal: event.target.value }))
                }
                placeholder="0.00"
              />
            </label>

            <label className="painel-field">
              <span>Label de destaque</span>
              <input
                value={form.destaque}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, destaque: event.target.value }))
                }
                placeholder="Ex: Melhor custo-beneficio"
              />
            </label>

            <label className="painel-field">
              <span>Escopo do plano</span>
              <select
                value={form.escopo}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, escopo: event.target.value }))
                }
              >
                <option value="basico">Basico</option>
                <option value="completo">Completo</option>
              </select>
            </label>

            <label className="painel-field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>

            <label className="painel-field">
              <span>Ordem</span>
              <input
                type="number"
                min="0"
                value={form.ordem}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, ordem: event.target.value }))
                }
              />
            </label>

            <label className="painel-field-inline">
              <input
                type="checkbox"
                checked={form.premium}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, premium: event.target.checked }))
                }
              />
              <span>Destacar como plano premium</span>
            </label>

            <label className="painel-field painel-field-full">
              <span>Descricao</span>
              <textarea
                rows="4"
                value={form.descricao}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, descricao: event.target.value }))
                }
                placeholder="Resumo comercial do plano"
              />
            </label>

            <label className="painel-field painel-field-full">
              <span>Beneficios</span>
              <textarea
                rows="6"
                value={form.beneficios}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, beneficios: event.target.value }))
                }
                placeholder={"Um beneficio por linha\nOutro beneficio"}
              />
            </label>

            <div className="painel-form-actions">
              {editingId ? (
                <button
                  type="button"
                  className="painel-secondary-button"
                  onClick={resetForm}
                >
                  Cancelar edicao
                </button>
              ) : null}
              <button
                type="submit"
                className="painel-primary-button"
                disabled={salvando}
              >
                {salvando ? "Salvando..." : editingId ? "Salvar plano" : "Criar plano"}
              </button>
            </div>
          </form>
        </section>

        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Planos ativos no sistema</h4>
              <p>O que estiver aqui passa a refletir na landing e no master</p>
            </div>
          </div>

          <div className="painel-mini-list">
            {planos.length > 0 ? (
              planos.map((plano) => (
                <div key={plano.id} className="painel-master-plan-card">
                  <div className="painel-master-plan-head">
                    <div>
                      <strong>{plano.nome}</strong>
                      <span>{plano.codigo}</span>
                    </div>
                    <span className={`painel-status-chip is-${plano.status}`}>
                      {plano.status}
                    </span>
                  </div>

                  <p className="painel-table-subcopy">{plano.descricao || "Sem descricao"}</p>

                  <div className="painel-master-plan-meta">
                    <span>
                      {Number(plano.valor_mensal || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}{" "}
                      / mes
                    </span>
                    <span>{plano.destaque || "Sem destaque"}</span>
                    <span>{plano.escopo}</span>
                  </div>

                  <div className="painel-tag-grid">
                    {plano.beneficios.map((beneficio) => (
                      <span key={beneficio} className="painel-tag">
                        {beneficio}
                      </span>
                    ))}
                  </div>

                  <div className="painel-form-actions">
                    <button
                      type="button"
                      className="painel-secondary-button"
                      onClick={() => fillForm(plano)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="painel-danger-button"
                      onClick={() => handleDelete(plano.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum plano cadastrado ainda.</div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
