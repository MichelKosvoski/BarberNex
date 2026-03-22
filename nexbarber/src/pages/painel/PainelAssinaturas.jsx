import { useEffect, useState } from "react";
import {
  createClienteAssinatura,
  createPlanoAssinatura,
  getClientesAssinaturas,
  getClientesPainel,
  getPainelBarbeariaId,
  getPlanosAssinatura,
} from "../../services/api";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PainelAssinaturas() {
  const [planos, setPlanos] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [planoForm, setPlanoForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    cortes_inclusos: 0,
    barbas_inclusas: 0,
    beneficios: "",
  });
  const [assinaturaForm, setAssinaturaForm] = useState({
    cliente_id: "",
    plano_id: "",
    data_inicio: "",
    data_vencimento: "",
    observacoes: "",
  });

  const barbeariaId = getPainelBarbeariaId();

  async function carregarTudo() {
    try {
      const [planosData, assinaturasData, clientesData] = await Promise.all([
        getPlanosAssinatura(barbeariaId),
        getClientesAssinaturas(barbeariaId),
        getClientesPainel(barbeariaId),
      ]);
      setPlanos(planosData);
      setAssinaturas(assinaturasData);
      setClientes(clientesData);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const handlePlanoSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setFeedback("");

    try {
      await createPlanoAssinatura(barbeariaId, {
        ...planoForm,
        preco: Number(planoForm.preco || 0),
        cortes_inclusos: Number(planoForm.cortes_inclusos || 0),
        barbas_inclusas: Number(planoForm.barbas_inclusas || 0),
      });
      setPlanoForm({
        nome: "",
        descricao: "",
        preco: "",
        cortes_inclusos: 0,
        barbas_inclusas: 0,
        beneficios: "",
      });
      setFeedback("Plano criado com sucesso.");
      await carregarTudo();
    } catch (error) {
      setErro(error.message);
    }
  };

  const handleAssinaturaSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setFeedback("");

    try {
      await createClienteAssinatura(barbeariaId, assinaturaForm);
      setAssinaturaForm({
        cliente_id: "",
        plano_id: "",
        data_inicio: "",
        data_vencimento: "",
        observacoes: "",
      });
      setFeedback("Assinatura vinculada com sucesso.");
      await carregarTudo();
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Assinaturas</p>
          <h3>Crie planos de corte mensal e vincule clientes recorrentes da barbearia.</h3>
        </div>
      </div>

      {feedback ? <div className="painel-feedback">{feedback}</div> : null}
      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Criar plano</h4>
              <p>Exemplo: 4 cortes por mes, corte + barba premium, etc.</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handlePlanoSubmit}>
            <input
              placeholder="Nome do plano"
              value={planoForm.nome}
              onChange={(e) => setPlanoForm((prev) => ({ ...prev, nome: e.target.value }))}
            />
            <input
              placeholder="Preco mensal"
              value={planoForm.preco}
              onChange={(e) => setPlanoForm((prev) => ({ ...prev, preco: e.target.value }))}
            />
            <input
              placeholder="Cortes inclusos"
              value={planoForm.cortes_inclusos}
              onChange={(e) =>
                setPlanoForm((prev) => ({ ...prev, cortes_inclusos: e.target.value }))
              }
            />
            <input
              placeholder="Barbas inclusas"
              value={planoForm.barbas_inclusas}
              onChange={(e) =>
                setPlanoForm((prev) => ({ ...prev, barbas_inclusas: e.target.value }))
              }
            />
            <input
              placeholder="Beneficios"
              value={planoForm.beneficios}
              onChange={(e) =>
                setPlanoForm((prev) => ({ ...prev, beneficios: e.target.value }))
              }
            />
            <textarea
              placeholder="Descricao do plano"
              value={planoForm.descricao}
              onChange={(e) => setPlanoForm((prev) => ({ ...prev, descricao: e.target.value }))}
            />
            <button className="painel-primary-button" type="submit">
              Criar plano
            </button>
          </form>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Vincular cliente ao plano</h4>
              <p>Assinatura ativa para corte recorrente</p>
            </div>
          </div>

          <form className="painel-form-grid" onSubmit={handleAssinaturaSubmit}>
            <select
              value={assinaturaForm.cliente_id}
              onChange={(e) =>
                setAssinaturaForm((prev) => ({ ...prev, cliente_id: e.target.value }))
              }
            >
              <option value="">Selecione o cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>

            <select
              value={assinaturaForm.plano_id}
              onChange={(e) =>
                setAssinaturaForm((prev) => ({ ...prev, plano_id: e.target.value }))
              }
            >
              <option value="">Selecione o plano</option>
              {planos.map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.nome}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={assinaturaForm.data_inicio}
              onChange={(e) =>
                setAssinaturaForm((prev) => ({ ...prev, data_inicio: e.target.value }))
              }
            />
            <input
              type="date"
              value={assinaturaForm.data_vencimento}
              onChange={(e) =>
                setAssinaturaForm((prev) => ({ ...prev, data_vencimento: e.target.value }))
              }
            />
            <textarea
              placeholder="Observacoes"
              value={assinaturaForm.observacoes}
              onChange={(e) =>
                setAssinaturaForm((prev) => ({ ...prev, observacoes: e.target.value }))
              }
            />
            <button className="painel-primary-button" type="submit">
              Vincular assinatura
            </button>
          </form>
        </article>
      </div>

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Planos cadastrados</h4>
              <p>Catalogo de assinatura da barbearia</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {planos.length > 0 ? (
              planos.map((plano) => (
                <div key={plano.id} className="painel-list-item">
                  <div>
                    <strong>{plano.nome}</strong>
                    <span>
                      {plano.cortes_inclusos} cortes / {plano.barbas_inclusas} barbas
                    </span>
                  </div>
                  <strong>{formatCurrency(plano.preco)}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum plano cadastrado.</div>
            )}
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Clientes assinantes</h4>
              <p>Gestao das assinaturas ativas</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {assinaturas.length > 0 ? (
              assinaturas.map((assinatura) => (
                <div key={assinatura.id} className="painel-list-item">
                  <div>
                    <strong>{assinatura.cliente_nome}</strong>
                    <span>
                      {assinatura.plano_nome} • {assinatura.status}
                    </span>
                  </div>
                  <strong>{formatCurrency(assinatura.plano_preco)}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhuma assinatura ativa.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
