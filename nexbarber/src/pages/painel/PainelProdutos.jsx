import { useEffect, useMemo, useState } from "react";
import { fileToDataUrl } from "../../utils/fileToDataUrl";
import {
  createProduto,
  deleteProduto,
  getPainelBarbeariaId,
  getProdutosPainel,
  updateProduto,
} from "../../services/api";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const categoriasPadrao = [
  "Bebida",
  "Cerveja",
  "Refrigerante",
  "Energetico",
  "Agua",
  "Cafe",
  "Snack",
  "Pomada",
  "Shampoo",
  "Outro",
];

const initialForm = {
  nome: "",
  descricao: "",
  imagem: "",
  preco: "",
  estoque: "",
  categoria: "Bebida",
  status: "ativo",
};

export default function PainelProdutos() {
  const barbeariaId = getPainelBarbeariaId();
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [arquivoImagemNome, setArquivoImagemNome] = useState("");

  async function carregarProdutos() {
    try {
      setErro("");
      const data = await getProdutosPainel(barbeariaId);
      setProdutos(Array.isArray(data) ? data : []);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  const produtosBaixoEstoque = useMemo(
    () => produtos.filter((produto) => Number(produto.estoque) <= 5),
    [produtos],
  );

  const produtosBebida = useMemo(
    () =>
      produtos.filter((produto) =>
        ["bebida", "cerveja", "refrigerante", "energetico", "agua", "cafe"].includes(
          String(produto.categoria || "").toLowerCase(),
        ),
      ),
    [produtos],
  );

  const resetForm = () => {
    setForm(initialForm);
    setEditandoId(null);
    setArquivoImagemNome("");
  };

  const preencherEdicao = (produto) => {
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      imagem: produto.imagem || "",
      preco: String(produto.preco ?? ""),
      estoque: String(produto.estoque ?? ""),
      categoria: produto.categoria || "Bebida",
      status: produto.status || "ativo",
    });
    setArquivoImagemNome("");
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
        descricao: form.descricao.trim(),
        preco: Number(form.preco || 0),
        estoque: Number(form.estoque || 0),
        categoria: form.categoria,
        status: form.status,
      };

      if (editandoId) {
        await updateProduto(editandoId, payload);
        setFeedback("Produto atualizado com sucesso.");
      } else {
        await createProduto(barbeariaId, payload);
        setFeedback("Produto cadastrado com sucesso.");
      }

      resetForm();
      await carregarProdutos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const removerProduto = async (id) => {
    const confirmar = window.confirm("Deseja remover este produto?");
    if (!confirmar) return;

    try {
      setErro("");
      setFeedback("");
      await deleteProduto(id);
      await carregarProdutos();
      setFeedback("Produto removido com sucesso.");
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Produtos</p>
          <h3>Cadastre bebidas, itens de espera, pomadas e produtos de giro rapido.</h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}
      {feedback ? <div className="painel-feedback">{feedback}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>{editandoId ? "Editar produto" : "Novo produto"}</h4>
              <p>Monte o catalogo do caixa e da recepcao.</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handleSubmit}>
            <label className="painel-field">
              <span>Nome</span>
              <input
                value={form.nome}
                onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Agua com gas"
                required
              />
            </label>

            <label className="painel-field">
              <span>Categoria</span>
              <select
                value={form.categoria}
                onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
              >
                {categoriasPadrao.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </label>

            <label className="painel-field">
              <span>Preco</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.preco}
                onChange={(e) => setForm((prev) => ({ ...prev, preco: e.target.value }))}
                placeholder="0,00"
                required
              />
            </label>

            <label className="painel-field">
              <span>Estoque</span>
              <input
                type="number"
                min="0"
                value={form.estoque}
                onChange={(e) => setForm((prev) => ({ ...prev, estoque: e.target.value }))}
                placeholder="0"
              />
            </label>

            <input
              id="upload-produto-imagem"
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

            <label htmlFor="upload-produto-imagem" className="painel-file-picker">
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

            <label className="painel-field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>

            <label className="painel-field painel-field-full">
              <span>Descricao</span>
              <textarea
                rows="4"
                value={form.descricao}
                onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
                placeholder="Ex: Servir gelada na recepcao, ideal para espera..."
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
                    ? "Salvar produto"
                    : "Cadastrar produto"}
              </button>
            </div>
          </form>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Leitura rapida</h4>
              <p>Itens de espera e alertas do caixa</p>
            </div>
          </div>

          <div className="painel-info-stack">
            <div className="painel-info-pill">
              <span>Total de produtos</span>
              <strong>{produtos.length}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Bebidas e conveniencia</span>
              <strong>{produtosBebida.length}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Baixo estoque</span>
              <strong>{produtosBaixoEstoque.length}</strong>
            </div>
          </div>

          <div className="painel-tag-grid">
            {produtosBaixoEstoque.length > 0 ? (
              produtosBaixoEstoque.map((produto) => (
                <span key={produto.id} className="painel-tag">
                  {produto.nome} - {produto.estoque} un
                </span>
              ))
            ) : (
              <div className="painel-empty-state">Sem alertas de estoque baixo.</div>
            )}
          </div>

          <div className="painel-product-preview">
            <div className="painel-product-card">
              <div className="painel-product-thumb">
                {form.imagem ? (
                  <img src={form.imagem} alt={form.nome || "Produto"} />
                ) : (
                  <span>Sem imagem</span>
                )}
              </div>

              <div className="painel-product-copy">
                <strong>{form.nome || "Novo produto"}</strong>
                <span>{form.categoria || "Categoria"}</span>
              </div>

              <div className="painel-product-meta">
                <strong>{formatCurrency(form.preco || 0)}</strong>
                <span>{form.estoque || 0} un</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <article className="painel-card">
        <div className="painel-card-header">
          <div>
            <h4>Catalogo de produtos</h4>
            <p>Bebidas, itens premium e apoio de atendimento.</p>
          </div>
        </div>

        <div className="painel-table-wrap">
          <table className="painel-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preco</th>
                <th>Estoque</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length > 0 ? (
                produtos.map((produto) => (
                  <tr key={produto.id}>
                    <td>
                      <div>
                        <div className="painel-product-row">
                          <div className="painel-product-row-thumb">
                            {produto.imagem ? (
                              <img src={produto.imagem} alt={produto.nome} />
                            ) : (
                              <span>{String(produto.nome || "P").charAt(0)}</span>
                            )}
                          </div>
                          <strong>{produto.nome}</strong>
                        </div>
                        {produto.descricao ? (
                          <div className="painel-table-subcopy">{produto.descricao}</div>
                        ) : null}
                      </div>
                    </td>
                    <td>{produto.categoria || "--"}</td>
                    <td>{formatCurrency(produto.preco)}</td>
                    <td>{produto.estoque} un</td>
                    <td>
                      <span
                        className={`painel-status-badge ${
                          produto.status === "ativo" ? "is-finalizado" : "is-cancelado"
                        }`}
                      >
                        {produto.status}
                      </span>
                    </td>
                    <td>
                      <div className="painel-table-actions">
                        <button
                          type="button"
                          className="painel-table-btn is-ghost"
                          onClick={() => preencherEdicao(produto)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="painel-table-btn is-danger-outline"
                          onClick={() => removerProduto(produto.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="painel-empty-cell">
                    Nenhum produto cadastrado.
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
