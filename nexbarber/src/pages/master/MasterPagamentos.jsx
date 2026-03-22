export default function MasterPagamentos() {
  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Mercado Pago</p>
          <h3>Base pronta para receber checkout, webhook e liberacao automatica assim que o pagamento for aprovado.</h3>
        </div>
      </div>

      <section className="painel-card">
        <div className="painel-empty-state">
          Proximo passo: integrar checkout do Mercado Pago, salvar cobrancas e ativar a barbearia automaticamente no webhook.
        </div>
      </section>
    </section>
  );
}
