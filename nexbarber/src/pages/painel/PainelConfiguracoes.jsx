import { useEffect, useState } from "react";
import { getBarbearia, getPainelBarbeariaId } from "../../services/api";

export default function PainelConfiguracoes() {
  const [barbearia, setBarbearia] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const barbeariaId = getPainelBarbeariaId();

    async function carregarConfiguracoes() {
      try {
        const data = await getBarbearia(barbeariaId);
        setBarbearia(data);
      } catch (error) {
        setErro(error.message);
      }
    }

    carregarConfiguracoes();
  }, []);

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Configuracoes</p>
          <h3>Central de identidade visual, operacao e preferencias da unidade.</h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Identidade da barbearia</h4>
              <p>Campos que vao refletir no site publico</p>
            </div>
          </div>

          <div className="painel-settings-grid">
            <div className="painel-setting-box">
              <span>Nome</span>
              <strong>{barbearia?.nome || "Nao definido"}</strong>
            </div>
            <div className="painel-setting-box">
              <span>Plano</span>
              <strong>{barbearia?.plano || "Nao definido"}</strong>
            </div>
            <div className="painel-setting-box">
              <span>Banner principal</span>
              <strong>{barbearia?.banner ? "Ativo" : "Pendente"}</strong>
            </div>
            <div className="painel-setting-box">
              <span>Logo</span>
              <strong>{barbearia?.logo ? "Ativa" : "Pendente upload"}</strong>
            </div>
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Preferencias operacionais</h4>
              <p>Leitura atual da unidade</p>
            </div>
          </div>

          <div className="painel-tag-grid">
            <span className="painel-tag">Telefone: {barbearia?.telefone || "Nao definido"}</span>
            <span className="painel-tag">Cidade: {barbearia?.cidade || "Nao definida"}</span>
            <span className="painel-tag">Status: {barbearia?.status || "Nao definido"}</span>
          </div>
        </article>
      </div>
    </section>
  );
}
