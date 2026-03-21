export default function PainelRelatorios() {
  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Relatorios</p>
          <h3>Leitura rapida dos numeros para tomada de decisao da barbearia.</h3>
        </div>
      </div>

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Indicadores do mes</h4>
              <p>Comparativo com periodo anterior</p>
            </div>
          </div>

          <div className="painel-info-stack">
            <div className="painel-info-pill">
              <span>Faturamento</span>
              <strong>R$ 18.430</strong>
            </div>
            <div className="painel-info-pill">
              <span>Ticket medio</span>
              <strong>R$ 82</strong>
            </div>
            <div className="painel-info-pill">
              <span>Retencao</span>
              <strong>68%</strong>
            </div>
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Insights</h4>
              <p>Oportunidades de crescimento</p>
            </div>
          </div>

          <div className="painel-tag-grid">
            <span className="painel-tag">Corte + barba lidera em receita</span>
            <span className="painel-tag">Sexta-feira tem maior ocupacao</span>
            <span className="painel-tag">Barba premium cresceu 14%</span>
          </div>
        </article>
      </div>
    </section>
  );
}
