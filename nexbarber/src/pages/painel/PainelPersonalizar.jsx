import { useEffect, useState } from "react";
import {
  getBarbearia,
  getPainelBarbeariaId,
  updateBarbearia,
} from "../../services/api";
import { fileToDataUrl } from "../../utils/fileToDataUrl";

const defaultForm = {
  nome: "",
  cidade: "",
  estado: "",
  telefone: "",
  descricao: "",
  logo: "",
  banner: "",
  plano: "",
  cor_primaria: "#f5c542",
  cor_secundaria: "#d7a52b",
  cor_fundo: "#050607",
  texto_hero: "",
  subtitulo_hero: "",
  horario_funcionamento: "",
  exibir_planos_publico: true,
  titulo_planos_publico: "Planos da barbearia",
  subtitulo_planos_publico: "Escolha um plano recorrente e mantenha seu visual em dia.",
};

export default function PainelPersonalizar() {
  const [form, setForm] = useState(defaultForm);
  const [feedback, setFeedback] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const barbeariaId = getPainelBarbeariaId();

    async function carregar() {
      try {
        const data = await getBarbearia(barbeariaId);
        setForm({
          ...defaultForm,
          ...data,
          cor_primaria: data.cor_primaria || "#f5c542",
          cor_secundaria: data.cor_secundaria || "#d7a52b",
          cor_fundo: data.cor_fundo || "#050607",
          texto_hero:
            data.texto_hero || `Agende seu horario na ${data.nome || "barbearia"}`,
          subtitulo_hero:
            data.subtitulo_hero || "Seu estilo, sua identidade, no seu tempo.",
          horario_funcionamento: data.horario_funcionamento || "",
          exibir_planos_publico:
            Number(data.exibir_planos_publico ?? 1) !== 0,
          titulo_planos_publico:
            data.titulo_planos_publico || "Planos da barbearia",
          subtitulo_planos_publico:
            data.subtitulo_planos_publico ||
            "Escolha um plano recorrente e mantenha seu visual em dia.",
        });
      } catch (error) {
        setErro(error.message);
      }
    }

    carregar();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setFeedback("");
    setLoading(true);

    try {
      const barbeariaId = getPainelBarbeariaId();
      await updateBarbearia(barbeariaId, form);
      setFeedback("Personalizacao salva com sucesso.");
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Personalizar Site</p>
          <h3>Altere as cores, imagens e textos que aparecem na pagina publica da barbearia.</h3>
        </div>
      </div>

      {feedback ? <div className="painel-feedback">{feedback}</div> : null}
      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Preview rapido</h4>
              <p>Visao de como a pagina publica vai reagir</p>
            </div>
          </div>

          <div
            className="painel-preview-card"
            style={{
              "--preview-bg": form.cor_fundo || "#050607",
              "--preview-primary": form.cor_primaria || "#f5c542",
              "--preview-secondary": form.cor_secundaria || "#d7a52b",
              backgroundImage: form.banner ? `url(${form.banner})` : "none",
            }}
          >
            <div className="painel-preview-overlay">
              <div className="painel-preview-logo">
                {form.logo ? <img src={form.logo} alt="logo" /> : <span>Logo</span>}
              </div>
              <h4>{form.texto_hero || form.nome || "Sua barbearia aqui"}</h4>
              <p>{form.subtitulo_hero || form.descricao || "Apresentacao da sua marca."}</p>
              <button type="button">Agendar horario</button>
            </div>
          </div>

          <div className="painel-list-grid" style={{ marginTop: "18px" }}>
            <div className="painel-list-item">
              <div>
                <strong>
                  {form.titulo_planos_publico || "Planos da barbearia"}
                </strong>
                <span>
                  {form.exibir_planos_publico
                    ? "Secao publica visivel no site"
                    : "Secao publica oculta no site"}
                </span>
              </div>
              <strong>{form.exibir_planos_publico ? "Ativa" : "Oculta"}</strong>
            </div>
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Editar conteudo</h4>
              <p>Tudo isso vai impactar o ModeloBarbearia</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handleSubmit}>
            <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome da barbearia" />
            <input name="cidade" value={form.cidade} onChange={handleChange} placeholder="Cidade" />
            <input name="estado" value={form.estado} onChange={handleChange} placeholder="Estado" />
            <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" />
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                const dataUrl = await fileToDataUrl(file);
                setForm((prev) => ({ ...prev, logo: dataUrl }));
              }}
            />
            <div className="painel-actions-row">
              <button
                className="painel-secondary-button"
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, logo: "" }))}
              >
                Remover logo
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                const dataUrl = await fileToDataUrl(file);
                setForm((prev) => ({ ...prev, banner: dataUrl }));
              }}
            />
            <div className="painel-actions-row">
              <button
                className="painel-secondary-button"
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, banner: "" }))}
              >
                Remover banner
              </button>
            </div>
            <input
              name="horario_funcionamento"
              value={form.horario_funcionamento}
              onChange={handleChange}
              placeholder="Horario de funcionamento"
            />
            <label className="painel-toggle">
              <input
                type="checkbox"
                name="exibir_planos_publico"
                checked={!!form.exibir_planos_publico}
                onChange={handleChange}
              />
              <span>Exibir secao de planos na pagina publica</span>
            </label>
            <input
              name="titulo_planos_publico"
              value={form.titulo_planos_publico}
              onChange={handleChange}
              placeholder="Titulo da secao de planos"
            />
            <input
              name="subtitulo_planos_publico"
              value={form.subtitulo_planos_publico}
              onChange={handleChange}
              placeholder="Subtitulo da secao de planos"
            />
            <input name="texto_hero" value={form.texto_hero} onChange={handleChange} placeholder="Titulo principal" />
            <input
              name="subtitulo_hero"
              value={form.subtitulo_hero}
              onChange={handleChange}
              placeholder="Subtitulo principal"
            />
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Descricao da barbearia"
            />

            <div className="painel-color-grid">
              <label>
                Cor primaria
                <input type="color" name="cor_primaria" value={form.cor_primaria} onChange={handleChange} />
              </label>
              <label>
                Cor secundaria
                <input type="color" name="cor_secundaria" value={form.cor_secundaria} onChange={handleChange} />
              </label>
              <label>
                Cor de fundo
                <input type="color" name="cor_fundo" value={form.cor_fundo} onChange={handleChange} />
              </label>
            </div>

            <button className="painel-primary-button" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar personalizacao"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
