export default function PainelConfiguracoes() {
  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Configuracoes</p>
          <h3>Central de identidade visual, operacao e preferencias da unidade.</h3>
        </div>
      </div>

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
              <span>Cor primaria</span>
              <strong>#F6C445</strong>
            </div>
            <div className="painel-setting-box">
              <span>Banner principal</span>
              <strong>Ativo</strong>
            </div>
            <div className="painel-setting-box">
              <span>Logo</span>
              <strong>Pendente upload</strong>
            </div>
            <div className="painel-setting-box">
              <span>Plano</span>
              <strong>Pro</strong>
            </div>
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Preferencias operacionais</h4>
              <p>Ajustes basicos da rotina</p>
            </div>
          </div>

          <div className="painel-tag-grid">
            <span className="painel-tag">Agenda online ativa</span>
            <span className="painel-tag">Confirmacao automatica</span>
            <span className="painel-tag">Notificacao para funcionario</span>
          </div>
        </article>
      </div>
    </section>
  );
}
