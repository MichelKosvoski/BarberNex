import { useEffect, useState } from "react";
import { getClientesPainel, getPainelBarbeariaId } from "../../services/api";

export default function PainelClientes() {
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const barbeariaId = getPainelBarbeariaId();

    async function carregarClientes() {
      try {
        const data = await getClientesPainel(barbeariaId);
        setClientes(data);
      } catch (error) {
        setErro(error.message);
      }
    }

    carregarClientes();
  }, []);

  const clientesComRetorno = clientes.filter(
    (cliente) => Number(cliente.total_agendamentos || 0) > 1,
  ).length;

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Clientes</p>
          <h3>Veja recorrencia, ticket medio e relacionamento com a base ativa.</h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}

      <div className="painel-section-grid">
        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Base ativa</h4>
              <p>Clientes recorrentes com maior potencial</p>
            </div>
          </div>

          <div className="painel-list-grid">
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <div key={cliente.id} className="painel-list-item">
                  <div>
                    <strong>{cliente.nome}</strong>
                    <span>{Number(cliente.total_agendamentos || 0)} agendamentos</span>
                  </div>
                  <strong>{cliente.telefone || "Sem telefone"}</strong>
                </div>
              ))
            ) : (
              <div className="painel-empty-state">Nenhum cliente cadastrado.</div>
            )}
          </div>
        </article>

        <article className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Indicadores</h4>
              <p>Resumo comercial da carteira</p>
            </div>
          </div>

          <div className="painel-info-stack">
            <div className="painel-info-pill">
              <span>Total cadastrados</span>
              <strong>{clientes.length}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Com retorno</span>
              <strong>{clientesComRetorno}</strong>
            </div>
            <div className="painel-info-pill">
              <span>Com e-mail</span>
              <strong>{clientes.filter((cliente) => Boolean(cliente.email)).length}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
