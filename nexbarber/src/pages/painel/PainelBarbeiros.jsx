import { useEffect, useState } from "react";
import BarberCard from "../../components/BarberCard";
import { fileToDataUrl } from "../../utils/fileToDataUrl";
import {
  createBarbeiro,
  deleteBarbeiro,
  getBarbeirosPainel,
  getPainelBarbeariaId,
  updateBarbeiro,
} from "../../services/api";

const emptyForm = {
  nome: "",
  especialidade: "",
  telefone: "",
  percentual_comissao: "",
  foto: "",
  status: "ativo",
};

export default function PainelBarbeiros() {
  const [barbeiros, setBarbeiros] = useState([]);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const barbeariaId = getPainelBarbeariaId();

  async function carregarBarbeiros() {
    try {
      const data = await getBarbeirosPainel(barbeariaId);
      setBarbeiros(data);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarBarbeiros();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setFeedback("");

    try {
      const payload = {
        ...form,
        percentual_comissao: form.percentual_comissao
          ? Number(form.percentual_comissao)
          : null,
      };

      if (editingId) {
        await updateBarbeiro(editingId, payload);
        setFeedback("Barbeiro atualizado com sucesso.");
      } else {
        await createBarbeiro(barbeariaId, payload);
        setFeedback("Barbeiro criado com sucesso.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await carregarBarbeiros();
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleEdit = (barbeiro) => {
    setEditingId(barbeiro.id);
    setForm({
      nome: barbeiro.nome || "",
      especialidade: barbeiro.especialidade || "",
      telefone: barbeiro.telefone || "",
      percentual_comissao: barbeiro.percentual_comissao || "",
      foto: barbeiro.foto || "",
      status: barbeiro.status || "ativo",
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteBarbeiro(id);
      setFeedback("Barbeiro removido com sucesso.");
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await carregarBarbeiros();
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Barbeiros</p>
          <h3>Crie os cards da equipe com foto real, especialidade e status.</h3>
        </div>
      </div>

      {feedback ? <div className="painel-feedback">{feedback}</div> : null}
      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>{editingId ? "Editar barbeiro" : "Novo barbeiro"}</h4>
              <p>Nome, foto, especialidade e comissao</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handleSubmit}>
            <input
              placeholder="Nome do barbeiro"
              value={form.nome}
              onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
            />
            <input
              placeholder="Especialidade"
              value={form.especialidade}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, especialidade: e.target.value }))
              }
            />
            <input
              placeholder="Telefone"
              value={form.telefone}
              onChange={(e) => setForm((prev) => ({ ...prev, telefone: e.target.value }))}
            />
            <input
              placeholder="Percentual de comissao"
              value={form.percentual_comissao}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, percentual_comissao: e.target.value }))
              }
            />

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                const dataUrl = await fileToDataUrl(file);
                setForm((prev) => ({ ...prev, foto: dataUrl }));
              }}
            />

            <div className="painel-actions-row">
              <button
                className="painel-secondary-button"
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, foto: "" }))}
              >
                Remover foto
              </button>
            </div>

            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>

            <div className="painel-actions-row">
              <button className="painel-primary-button" type="submit">
                {editingId ? "Salvar alteracoes" : "Criar barbeiro"}
              </button>
              {editingId ? (
                <button
                  className="painel-secondary-button"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Preview do card</h4>
              <p>Base da exibicao na pagina publica</p>
            </div>
          </div>

          <div className="painel-service-preview">
            <BarberCard
              barbeiro={{
                nome: form.nome || "Novo barbeiro",
                especialidade: form.especialidade || "Especialidade",
                foto: form.foto,
              }}
              selected
              onSelect={() => {}}
            />
          </div>
        </article>
      </div>

      <article className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Equipe ativa</h4>
            <p>Barbeiros cadastrados e exibidos no site</p>
          </div>
        </div>

        <div className="painel-servicos-grid">
          {barbeiros.length > 0 ? (
            barbeiros.map((barbeiro) => (
              <div key={barbeiro.id} className="painel-servico-card-wrap">
                <BarberCard barbeiro={barbeiro} onSelect={() => handleEdit(barbeiro)} />
                <div className="painel-servico-meta">
                  <span>{barbeiro.status}</span>
                  <div className="painel-actions-row">
                    <button
                      className="painel-secondary-button"
                      type="button"
                      onClick={() => handleEdit(barbeiro)}
                    >
                      Editar
                    </button>
                    <button
                      className="painel-danger-button"
                      type="button"
                      onClick={() => handleDelete(barbeiro.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="painel-empty-state">Nenhum barbeiro cadastrado.</div>
          )}
        </div>
      </article>
    </section>
  );
}
