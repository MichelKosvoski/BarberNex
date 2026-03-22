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
  cor_card: "#11141b",
  cor_borda: "#2a2f39",
  cor_texto: "#f3f4f6",
  cor_texto_secundario: "rgba(255, 255, 255, 0.84)",
  cor_botao_texto: "#151515",
  fonte_titulo: "Georgia, 'Times New Roman', serif",
  fonte_corpo: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  tamanho_titulo: 42,
  tamanho_texto: 18,
  tamanho_logo: 86,
  texto_hero: "",
  subtitulo_hero: "",
  overlay_cor: "#000000",
  overlay_opacidade: 72,
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
  const [logoFileName, setLogoFileName] = useState("");
  const [bannerFileName, setBannerFileName] = useState("");
  const [previewTab, setPreviewTab] = useState("agendamento");

  const fontesTitulos = [
    { label: "Classica Serif", value: "Georgia, 'Times New Roman', serif" },
    { label: "Elegante Moderna", value: "'Trebuchet MS', 'Segoe UI', sans-serif" },
    { label: "Impacto Premium", value: "'Arial Black', Arial, sans-serif" },
    { label: "Condensada", value: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif" },
    { label: "Luxo Editorial", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  ];

  const fontesCorpo = [
    { label: "Limpa Moderna", value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    { label: "Neutra", value: "Arial, Helvetica, sans-serif" },
    { label: "Editorial", value: "Georgia, 'Times New Roman', serif" },
    { label: "Tecnica", value: "'Trebuchet MS', sans-serif" },
    { label: "Sistema", value: "system-ui, sans-serif" },
  ];

  const previewServico = {
    nome: "Degrade",
    preco: "R$ 35,00",
    duracao: "40 min",
  };

  const previewBarbeiro = {
    nome: "Daniel",
    especialidade: "Cortes Modernos",
  };

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
          cor_card: data.cor_card || "#11141b",
          cor_borda: data.cor_borda || "#2a2f39",
          cor_texto: data.cor_texto || "#f3f4f6",
          cor_texto_secundario: data.cor_texto_secundario || "rgba(255, 255, 255, 0.84)",
          cor_botao_texto: data.cor_botao_texto || "#151515",
          fonte_titulo: data.fonte_titulo || "Georgia, 'Times New Roman', serif",
          fonte_corpo:
            data.fonte_corpo || "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          tamanho_titulo: Number(data.tamanho_titulo || 42),
          tamanho_texto: Number(data.tamanho_texto || 18),
          tamanho_logo: Number(data.tamanho_logo || 86),
          texto_hero:
            data.texto_hero || `Agende seu horario na ${data.nome || "barbearia"}`,
          subtitulo_hero:
            data.subtitulo_hero || "Seu estilo, sua identidade, no seu tempo.",
          overlay_cor: data.overlay_cor || "#000000",
          overlay_opacidade: Number(data.overlay_opacidade ?? 72),
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
            className="painel-site-preview"
            style={{
              "--preview-bg": form.cor_fundo || "#050607",
              "--preview-primary": form.cor_primaria || "#f5c542",
              "--preview-secondary": form.cor_secundaria || "#d7a52b",
              "--preview-card": form.cor_card || "#11141b",
              "--preview-border": form.cor_borda || "#2a2f39",
              "--preview-text": form.cor_texto || "#f3f4f6",
              "--preview-muted": form.cor_texto_secundario || "rgba(255, 255, 255, 0.84)",
              "--preview-button-text": form.cor_botao_texto || "#151515",
              "--preview-title-size": `${Number(form.tamanho_titulo || 42)}px`,
              "--preview-body-size": `${Number(form.tamanho_texto || 18)}px`,
              "--preview-logo-size": `${Number(form.tamanho_logo || 86)}px`,
              "--preview-title-font": form.fonte_titulo,
              "--preview-body-font": form.fonte_corpo,
              "--preview-hero-overlay": toRgba(
                form.overlay_cor || "#000000",
                Number(form.overlay_opacidade ?? 72) / 100,
              ),
            }}
          >
            <div
              className="painel-preview-card"
              style={{
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

            {form.exibir_planos_publico ? (
              <div className="painel-preview-planos">
                <div className="painel-preview-planos-copy">
                  <span className="painel-preview-kicker">Assinaturas da barbearia</span>
                  <strong>{form.titulo_planos_publico || "Planos da barbearia"}</strong>
                  <p>
                    {form.subtitulo_planos_publico ||
                      "Escolha um plano recorrente e mantenha seu visual em dia."}
                  </p>
                </div>
                <article className="painel-preview-plano-card">
                  <span className="painel-preview-pill">Mensal</span>
                  <h5>Plano Prata</h5>
                  <div className="painel-preview-price">
                    <strong>R$ 60,00</strong>
                    <span>/ mes</span>
                  </div>
                  <ul>
                    <li>4 cortes inclusos</li>
                    <li>1 barba bonus</li>
                  </ul>
                  <button type="button">Quero esse plano</button>
                </article>
              </div>
            ) : null}

            <div className="painel-preview-tabs">
              <button
                type="button"
                className={previewTab === "agendamento" ? "is-active" : ""}
                onClick={() => setPreviewTab("agendamento")}
              >
                Agendamento
              </button>
              <button
                type="button"
                className={previewTab === "servicos" ? "is-active" : ""}
                onClick={() => setPreviewTab("servicos")}
              >
                Servicos
              </button>
              <button
                type="button"
                className={previewTab === "barbeiros" ? "is-active" : ""}
                onClick={() => setPreviewTab("barbeiros")}
              >
                Escolha seu barbeiro
              </button>
            </div>

            {previewTab === "agendamento" ? (
              <section className="painel-preview-stage">
                <div className="painel-preview-stage-copy">
                  <span className="painel-preview-kicker">Agendamento</span>
                  <strong>Reserve seu horario com poucos cliques</strong>
                  <p>Escolha a data, selecione um horario e avance para montar seu atendimento.</p>
                </div>

                <div className="painel-preview-booking">
                  <div className="painel-preview-info-card">
                    <div>{form.cidade || "Sao Paulo"} - {form.estado || "SP"}</div>
                    <div>{form.telefone || "(11) 99999-9999"}</div>
                    <div>{form.horario_funcionamento || "09:00 as 19:00"}</div>
                  </div>

                  <div className="painel-preview-calendar-card">
                    <div className="painel-preview-calendar-head">
                      <button type="button">{"<"}</button>
                      <strong>Marco de 2026</strong>
                      <button type="button">{">"}</button>
                    </div>
                    <div className="painel-preview-calendar-grid">
                      {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, index) => (
                        <span key={`${dia}-${index}`} className="painel-preview-weekday">{dia}</span>
                      ))}
                      {[22, 23, 24, 25, 26, 27, 28].map((dia) => (
                        <button
                          key={dia}
                          type="button"
                          className={`painel-preview-day ${dia === 23 ? "is-active" : ""}`}
                        >
                          {dia}
                        </button>
                      ))}
                    </div>
                    <div className="painel-preview-times">
                      {["09:00", "09:30", "10:00", "14:30"].map((hora) => (
                        <button
                          key={hora}
                          type="button"
                          className={`painel-preview-time ${hora === "10:00" ? "is-active" : ""}`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="painel-preview-summary-card">
                    <h5>Resumo do agendamento</h5>
                    <div className="painel-preview-summary-row">
                      <span>Servico</span>
                      <strong>{previewServico.nome}</strong>
                    </div>
                    <div className="painel-preview-summary-row">
                      <span>Data</span>
                      <strong>23/03</strong>
                    </div>
                    <div className="painel-preview-summary-row">
                      <span>Horario</span>
                      <strong>10:00</strong>
                    </div>
                    <div className="painel-preview-summary-row">
                      <span>Barbeiro</span>
                      <strong>{previewBarbeiro.nome}</strong>
                    </div>
                    <div className="painel-preview-summary-total">
                      <span>Total</span>
                      <strong>{previewServico.preco}</strong>
                    </div>
                    <button type="button">Confirmar agendamento</button>
                  </div>
                </div>
              </section>
            ) : null}

            {previewTab === "servicos" ? (
              <section className="painel-preview-stage">
                <div className="painel-preview-stage-copy">
                  <span className="painel-preview-kicker">Catalogo</span>
                  <strong>Servicos em destaque</strong>
                  <p>Filtre por categoria, compare os precos e escolha o servico ideal.</p>
                </div>

                <div className="painel-preview-catalog painel-preview-catalog-services">
                  <article className="painel-preview-service-card">
                    <div
                      className="painel-preview-service-image"
                      style={{ backgroundImage: form.banner ? `url(${form.banner})` : "none" }}
                    >
                      <span className="painel-preview-pill">Corte</span>
                    </div>
                    <div className="painel-preview-service-body">
                      <strong>{previewServico.nome}</strong>
                      <div className="painel-preview-service-meta">
                        <span>{previewServico.duracao}</span>
                        <span>{previewServico.preco}</span>
                      </div>
                      <button type="button">Selecionar</button>
                    </div>
                  </article>
                </div>
              </section>
            ) : null}

            {previewTab === "barbeiros" ? (
              <section className="painel-preview-stage">
                <div className="painel-preview-stage-copy">
                  <span className="painel-preview-kicker">Equipe</span>
                  <strong>Escolha seu barbeiro</strong>
                  <p>Compare especialidades, avaliacoes e defina quem vai atender voce.</p>
                </div>

                <div className="painel-preview-catalog painel-preview-catalog-barbers">
                  <article className="painel-preview-barber-card">
                    <div
                      className="painel-preview-barber-image"
                      style={{ backgroundImage: form.banner ? `url(${form.banner})` : "none" }}
                    />
                    <div className="painel-preview-barber-body">
                      <strong>{previewBarbeiro.nome}</strong>
                      <span>{previewBarbeiro.especialidade}</span>
                      <button type="button">Selecionar</button>
                    </div>
                  </article>
                </div>
              </section>
            ) : null}
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
              id="upload-logo"
              className="painel-file-input"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file);
                setLogoFileName(file.name);
                setForm((prev) => ({ ...prev, logo: dataUrl }));
              }}
            />
            <label htmlFor="upload-logo" className="painel-file-picker">
              <span className="painel-file-button">Escolher logo</span>
              <span className="painel-file-name">
                {logoFileName || (form.logo ? "Logo carregada" : "Nenhum arquivo escolhido")}
              </span>
            </label>
            <div className="painel-actions-row">
              <button
                className="painel-secondary-button"
                type="button"
                onClick={() => {
                  setLogoFileName("");
                  setForm((prev) => ({ ...prev, logo: "" }));
                }}
              >
                Remover logo
              </button>
            </div>

            <input
              id="upload-banner"
              className="painel-file-input"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file);
                setBannerFileName(file.name);
                setForm((prev) => ({ ...prev, banner: dataUrl }));
              }}
            />
            <label htmlFor="upload-banner" className="painel-file-picker">
              <span className="painel-file-button">Escolher banner</span>
              <span className="painel-file-name">
                {bannerFileName || (form.banner ? "Banner carregado" : "Nenhum arquivo escolhido")}
              </span>
            </label>
            <div className="painel-actions-row">
              <button
                className="painel-secondary-button"
                type="button"
                onClick={() => {
                  setBannerFileName("");
                  setForm((prev) => ({ ...prev, banner: "" }));
                }}
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
            <div className="painel-color-grid">
              <label>
                Cor da sombra sobre o banner
                <input type="color" name="overlay_cor" value={form.overlay_cor} onChange={handleChange} />
              </label>
              <label className="painel-range-label painel-range-wide">
                Intensidade da sombra: {form.overlay_opacidade}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  name="overlay_opacidade"
                  value={form.overlay_opacidade}
                  onChange={handleChange}
                />
              </label>
            </div>
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
              <label>
                Cor dos cards
                <input type="color" name="cor_card" value={form.cor_card} onChange={handleChange} />
              </label>
              <label>
                Cor das bordas
                <input type="color" name="cor_borda" value={form.cor_borda} onChange={handleChange} />
              </label>
              <label>
                Cor do texto
                <input type="color" name="cor_texto" value={form.cor_texto} onChange={handleChange} />
              </label>
              <label>
                Cor do texto secundario
                <input type="color" name="cor_texto_secundario" value={hexFromColor(form.cor_texto_secundario)} onChange={(e) => setForm((prev) => ({ ...prev, cor_texto_secundario: e.target.value }))} />
              </label>
              <label>
                Cor do texto do botao
                <input type="color" name="cor_botao_texto" value={form.cor_botao_texto} onChange={handleChange} />
              </label>
            </div>

            <div className="painel-color-grid">
              <label>
                Fonte do titulo
                <select name="fonte_titulo" value={form.fonte_titulo} onChange={handleChange}>
                  {fontesTitulos.map((fonte) => (
                    <option key={fonte.value} value={fonte.value}>{fonte.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Fonte do texto
                <select name="fonte_corpo" value={form.fonte_corpo} onChange={handleChange}>
                  {fontesCorpo.map((fonte) => (
                    <option key={fonte.value} value={fonte.value}>{fonte.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="painel-color-grid">
              <label>
                Tamanho do titulo: {form.tamanho_titulo}px
                <input
                  type="range"
                  min="30"
                  max="72"
                  step="1"
                  name="tamanho_titulo"
                  value={form.tamanho_titulo}
                  onChange={handleChange}
                />
              </label>
              <label>
                Tamanho do texto: {form.tamanho_texto}px
                <input
                  type="range"
                  min="14"
                  max="26"
                  step="1"
                  name="tamanho_texto"
                  value={form.tamanho_texto}
                  onChange={handleChange}
                />
              </label>
              <label>
                Tamanho do logo: {form.tamanho_logo}px
                <input
                  type="range"
                  min="60"
                  max="140"
                  step="1"
                  name="tamanho_logo"
                  value={form.tamanho_logo}
                  onChange={handleChange}
                />
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

function hexFromColor(color) {
  if (!color || color.startsWith("#")) return color || "#ffffff";
  const match = color.match(/\d+/g);
  if (!match || match.length < 3) return "#ffffff";
  const [r, g, b] = match.map(Number);
  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function toRgba(color, alpha) {
  if (!color) return `rgba(0, 0, 0, ${alpha})`;
  if (color.startsWith("rgba")) return color;
  if (color.startsWith("rgb")) {
    const match = color.match(/\d+/g);
    if (!match || match.length < 3) return `rgba(0, 0, 0, ${alpha})`;
    const [r, g, b] = match.map(Number);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const hex = color.replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const int = Number.parseInt(normalized, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
