import { useEffect, useState } from "react";
import ServiceCard from "../../components/ServiceCard";
import { fileToDataUrl } from "../../utils/fileToDataUrl";
import {
  createServico,
  deleteServico,
  getPainelBarbeariaId,
  getServicosPainel,
  updateServico,
} from "../../services/api";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const emptyForm = {
  nome: "",
  descricao: "",
  preco: "",
  duracao_minutos: "",
  categoria: "",
  imagem: "",
  status: "ativo",
};

export default function PainelServicos() {
  const [servicos, setServicos] = useState([]);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [arquivoImagemNome, setArquivoImagemNome] = useState("");

  const barbeariaId = getPainelBarbeariaId();

  async function carregarServicos() {
    try {
      const data = await getServicosPainel(barbeariaId);
      setServicos(data);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarServicos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setFeedback("");

    try {
      const payload = {
        ...form,
        preco: Number(form.preco || 0),
        duracao_minutos: Number(form.duracao_minutos || 0),
      };

      if (editingId) {
        await updateServico(editingId, payload);
        setFeedback("Servico atualizado com sucesso.");
      } else {
        await createServico(barbeariaId, payload);
        setFeedback("Servico criado com sucesso.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setArquivoImagemNome("");
      await carregarServicos();
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleEdit = (servico) => {
    setEditingId(servico.id);
    setForm({
      nome: servico.nome || "",
      descricao: servico.descricao || "",
      preco: servico.preco || "",
      duracao_minutos: servico.duracao_minutos || "",
      categoria: servico.categoria || "",
      imagem: servico.imagem || "",
      status: servico.status || "ativo",
    });
    setArquivoImagemNome("");
  };

  const handleDelete = async (id) => {
    try {
      setErro("");
      setFeedback("");
      await deleteServico(id);
      setFeedback("Servico removido com sucesso.");
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await carregarServicos();
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Servicos</p>
          <h3>Organize o catalogo, escolha imagens locais e controle o que aparece no site.</h3>
        </div>
      </div>

      {feedback ? <div className="painel-feedback">{feedback}</div> : null}
      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>{editingId ? "Editar servico" : "Novo servico"}</h4>
              <p>Nome, preco, tempo e imagem do card publico</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handleSubmit}>
            <input
              placeholder="Nome do servico"
              value={form.nome}
              onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
            />
            <input
              placeholder="Preco"
              value={form.preco}
              onChange={(e) => setForm((prev) => ({ ...prev, preco: e.target.value }))}
            />
            <input
              placeholder="Duracao em minutos"
              value={form.duracao_minutos}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, duracao_minutos: e.target.value }))
              }
            />
            <input
              placeholder="Categoria"
              value={form.categoria}
              onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
            />

            <input
              id="upload-servico-imagem"
              className="painel-file-input"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                const dataUrl = await fileToDataUrl(file);
                setArquivoImagemNome(file?.name || "");
                setForm((prev) => ({ ...prev, imagem: dataUrl }));
              }}
            />

            <label htmlFor="upload-servico-imagem" className="painel-file-picker">
              <span className="painel-file-button">Escolher imagem</span>
              <span className="painel-file-name">
                {arquivoImagemNome || (form.imagem ? "Imagem carregada" : "Nenhum arquivo escolhido")}
              </span>
            </label>

            <div className="painel-actions-row">
              <button
                className="painel-secondary-button"
                type="button"
                onClick={() => {
                  setArquivoImagemNome("");
                  setForm((prev) => ({ ...prev, imagem: "" }));
                }}
              >
                Remover imagem
              </button>
            </div>

            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>

            <textarea
              placeholder="Descricao do servico"
              value={form.descricao}
              onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
            />

            <div className="painel-actions-row">
              <button className="painel-primary-button" type="submit">
                {editingId ? "Salvar alteracoes" : "Criar servico"}
              </button>
              {editingId ? (
                <button
                  className="painel-secondary-button"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setArquivoImagemNome("");
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
              <p>Base para a pagina publica da barbearia</p>
            </div>
          </div>

          <div className="painel-service-preview">
            <ServiceCard
              servico={{
                ...form,
                duracao: form.duracao_minutos || 0,
                preco: form.preco || 0,
                categoria: form.categoria ? [form.categoria] : [],
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
            <h4>Catalogo principal</h4>
            <p>Servicos cadastrados na barbearia</p>
          </div>
        </div>

        <div className="painel-servicos-grid">
          {servicos.length > 0 ? (
            servicos.map((servico) => (
              <div key={servico.id} className="painel-servico-card-wrap">
                <ServiceCard
                  servico={{
                    ...servico,
                    duracao: servico.duracao_minutos,
                    categoria: servico.categoria ? [servico.categoria] : [],
                  }}
                  onSelect={() => handleEdit(servico)}
                />
                <div className="painel-servico-meta">
                  <span>{formatCurrency(servico.preco)}</span>
                  <div className="painel-actions-row">
                    <button
                      className="painel-secondary-button"
                      type="button"
                      onClick={() => handleEdit(servico)}
                    >
                      Editar
                    </button>
                    <button
                      className="painel-danger-button"
                      type="button"
                      onClick={() => handleDelete(servico.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="painel-empty-state">Nenhum servico cadastrado.</div>
          )}
        </div>
      </article>
    </section>
  );
}
