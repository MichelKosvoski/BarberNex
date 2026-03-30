import { useEffect, useMemo, useState } from "react";
import {
  getMasterBarbearias,
  getMasterPlanos,
  updateMasterBarbearia,
} from "../../services/api";

const estadosBrasil = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const initialEdit = {
  id: null,
  nome: "",
  status: "ativo",
  plano: "",
  plano_id: "",
  plano_codigo: "",
  status_assinatura: "pendente",
  status_pagamento: "pendente",
  vencimento_assinatura: "",
  ultimo_pagamento: "",
  valor_mensalidade: "",
  destaque_home: false,
  observacoes_admin: "",
};

export default function MasterBarbearias() {
  const [barbearias, setBarbearias] = useState([]);
  const [planosSistema, setPlanosSistema] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroAssinatura, setFiltroAssinatura] = useState("");
  const [filtroPagamento, setFiltroPagamento] = useState("");
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(initialEdit);

  async function carregar() {
    try {
      const [respostaBarbearias, respostaPlanos] = await Promise.all([
        getMasterBarbearias(),
        getMasterPlanos(),
      ]);
      setBarbearias(Array.isArray(respostaBarbearias) ? respostaBarbearias : []);
      setPlanosSistema(Array.isArray(respostaPlanos) ? respostaPlanos : []);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregar();
    const intervalId = setInterval(carregar, 12000);

    return () => clearInterval(intervalId);
  }, []);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return barbearias.filter((item) => {
      const bateBusca =
        !termo ||
        [
          item.nome,
          item.cidade,
          item.estado,
          item.plano,
          item.responsavel_nome,
          item.responsavel_email,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(termo));

      const bateEstado = !filtroEstado || item.estado === filtroEstado;
      const bateAssinatura =
        !filtroAssinatura || item.status_assinatura === filtroAssinatura;
      const batePagamento =
        !filtroPagamento || item.status_pagamento === filtroPagamento;

      return bateBusca && bateEstado && bateAssinatura && batePagamento;
    });
  }, [barbearias, busca, filtroEstado, filtroAssinatura, filtroPagamento]);

  const resumoCarteira = useMemo(() => {
    return {
      total: barbearias.length,
      ativas: barbearias.filter((item) => item.status_assinatura === "ativa")
        .length,
      pendentes: barbearias.filter(
        (item) => item.status_assinatura === "pendente",
      ).length,
      bloqueadas: barbearias.filter(
        (item) => item.status_assinatura === "bloqueada",
      ).length,
    };
  }, [barbearias]);

  const planoSelecionado = useMemo(
    () =>
      planosSistema.find((item) => String(item.id) === String(editando.plano_id)) || null,
    [editando.plano_id, planosSistema],
  );

  const iniciarEdicao = (item) => {
    setFeedback("");
    setErro("");
    setEditando({
      id: item.id,
      nome: item.nome || "",
      status: item.status || "ativo",
      plano: item.plano || "",
      plano_id: item.plano_id ? String(item.plano_id) : "",
      plano_codigo: item.plano_codigo || "",
      status_assinatura: item.status_assinatura || "pendente",
      status_pagamento: item.status_pagamento || "pendente",
      vencimento_assinatura: item.vencimento_assinatura
        ? String(item.vencimento_assinatura).slice(0, 10)
        : "",
      ultimo_pagamento: item.ultimo_pagamento
        ? String(item.ultimo_pagamento).slice(0, 10)
        : "",
      valor_mensalidade: item.valor_mensalidade ?? "",
      destaque_home: Boolean(item.destaque_home),
      observacoes_admin: item.observacoes_admin || "",
    });
  };

  const handlePlanoChange = (value) => {
    const plano = planosSistema.find((item) => String(item.id) === String(value));

    setEditando((prev) => ({
      ...prev,
      plano: plano?.nome || "",
      plano_id: value,
      plano_codigo: plano?.codigo || "",
      valor_mensalidade:
        value === ""
          ? ""
          : plano
          ? String(plano.valor_mensal)
          : prev.valor_mensalidade,
    }));
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!editando.id) return;

    try {
      setErro("");
      setFeedback("");
      setSalvando(true);

      await updateMasterBarbearia(editando.id, {
        status: editando.status,
        plano: editando.plano,
        plano_id: editando.plano_id ? Number(editando.plano_id) : null,
        plano_codigo: editando.plano_codigo || null,
        status_assinatura: editando.status_assinatura,
        status_pagamento: editando.status_pagamento,
        vencimento_assinatura: editando.vencimento_assinatura || null,
        ultimo_pagamento: editando.ultimo_pagamento || null,
        valor_mensalidade: Number(editando.valor_mensalidade || 0),
        destaque_home: editando.destaque_home,
        observacoes_admin: editando.observacoes_admin,
      });

      setFeedback("Barbearia atualizada com sucesso.");
      await carregar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Operacao comercial</p>
          <h3>
            Ative, bloqueie, altere plano e marque pagamento manualmente sem
            entrar no painel da barbearia.
          </h3>
        </div>
      </div>

      {erro ? <div className="painel-feedback erro">{erro}</div> : null}
      {feedback ? <div className="painel-feedback">{feedback}</div> : null}

      <div className="painel-stats-grid painel-stats-grid-4">
        <article className="painel-stat-card painel-accent-blue">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Total</span>
          </div>
          <strong className="painel-stat-value">{resumoCarteira.total}</strong>
          <p className="painel-stat-detail">Barbearias cadastradas</p>
        </article>

        <article className="painel-stat-card painel-accent-green">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Ativas</span>
          </div>
          <strong className="painel-stat-value">{resumoCarteira.ativas}</strong>
          <p className="painel-stat-detail">Assinaturas liberadas</p>
        </article>

        <article className="painel-stat-card painel-accent-gold">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Pendentes</span>
          </div>
          <strong className="painel-stat-value">
            {resumoCarteira.pendentes}
          </strong>
          <p className="painel-stat-detail">Aguardando definicao</p>
        </article>

        <article className="painel-stat-card painel-accent-danger">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Bloqueadas</span>
          </div>
          <strong className="painel-stat-value">
            {resumoCarteira.bloqueadas}
          </strong>
          <p className="painel-stat-detail">Sem acesso ao painel</p>
        </article>
      </div>

      <div className="painel-grid painel-grid-main">
        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Barbearias cadastradas</h4>
              <p>Carteira da plataforma com filtro rapido</p>
            </div>
          </div>

          <div className="painel-table-toolbar">
            <input
              className="painel-search"
              placeholder="Buscar por barbearia, cidade, plano ou responsavel"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              className="painel-toolbar-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos os estados</option>
              {estadosBrasil.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            <select
              className="painel-toolbar-select"
              value={filtroAssinatura}
              onChange={(e) => setFiltroAssinatura(e.target.value)}
            >
              <option value="">Todas as assinaturas</option>
              <option value="pendente">Pendente</option>
              <option value="ativa">Ativa</option>
              <option value="atrasada">Atrasada</option>
              <option value="cancelada">Cancelada</option>
              <option value="bloqueada">Bloqueada</option>
            </select>

            <select
              className="painel-toolbar-select"
              value={filtroPagamento}
              onChange={(e) => setFiltroPagamento(e.target.value)}
            >
              <option value="">Todos os pagamentos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div className="painel-table-wrap">
            <table className="painel-table">
              <thead>
                <tr>
                  <th>Barbearia</th>
                  <th>Plano</th>
                  <th>Assinatura</th>
                  <th>Pagamento</th>
                  <th>Mensalidade</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.length > 0 ? (
                  listaFiltrada.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.nome}</strong>
                        <div className="painel-cell-copy">
                          {(item.cidade || "Cidade") +
                            " - " +
                            (item.estado || "--")}
                        </div>
                        <div className="painel-cell-copy">
                          {item.responsavel_nome || "Sem responsavel"}
                        </div>
                      </td>
                      <td>{item.plano || "Sem plano"}</td>
                      <td>
                        <span
                          className={`painel-status-chip is-${item.status_assinatura || "pendente"}`}
                        >
                          {item.status_assinatura || "pendente"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`painel-status-chip is-${item.status_pagamento || "pendente"}`}
                        >
                          {item.status_pagamento || "pendente"}
                        </span>
                      </td>
                      <td>
                        {Number(item.valor_mensalidade || 0).toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          },
                        )}
                      </td>
                      <td>
                        <div className="painel-table-actions">
                          <button
                            type="button"
                            className="painel-table-btn is-primary"
                            onClick={() => iniciarEdicao(item)}
                          >
                            Gerenciar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="painel-empty-cell">
                      Nenhuma barbearia encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Gestao da assinatura</h4>
              <p>Controle acesso, pagamento e destaque</p>
            </div>
          </div>

          {editando.id ? (
            <form className="painel-form-grid" onSubmit={salvar}>
              <div className="painel-master-selected">
                <strong>{editando.nome}</strong>
                <span>
                  Atualize manualmente o status comercial dessa barbearia.
                </span>
              </div>

              <label className="painel-field">
                <span>Status da barbearia</span>
                <select
                  value={editando.status}
                  onChange={(e) =>
                    setEditando((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>

              <label className="painel-field">
                <span>Plano</span>
                <select
                  value={editando.plano_id}
                  onChange={(e) => handlePlanoChange(e.target.value)}
                >
                  <option value="">Sem plano</option>
                  {planosSistema.map((plano) => (
                    <option key={plano.id} value={plano.id}>
                      {plano.nome} -{" "}
                      {Number(plano.valor_mensal || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </option>
                  ))}
                </select>
                <small className="painel-field-help">
                  {planoSelecionado?.descricao || "Barbearia sem assinatura definida."}
                </small>
              </label>

              <label className="painel-field">
                <span>Status da assinatura</span>
                <select
                  value={editando.status_assinatura}
                  onChange={(e) =>
                    setEditando((prev) => ({
                      ...prev,
                      status_assinatura: e.target.value,
                    }))
                  }
                >
                  <option value="pendente">Pendente</option>
                  <option value="ativa">Ativa</option>
                  <option value="atrasada">Atrasada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="bloqueada">Bloqueada</option>
                </select>
              </label>

              <label className="painel-field">
                <span>Status do pagamento</span>
                <select
                  value={editando.status_pagamento}
                  onChange={(e) =>
                    setEditando((prev) => ({
                      ...prev,
                      status_pagamento: e.target.value,
                    }))
                  }
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                  <option value="manual">Manual</option>
                </select>
              </label>

              <label className="painel-field">
                <span>Vencimento</span>
                <input
                  type="date"
                  value={editando.vencimento_assinatura}
                  onChange={(e) =>
                    setEditando((prev) => ({
                      ...prev,
                      vencimento_assinatura: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="painel-field">
                <span>Ultimo pagamento</span>
                <input
                  type="date"
                  value={editando.ultimo_pagamento}
                  onChange={(e) =>
                    setEditando((prev) => ({
                      ...prev,
                      ultimo_pagamento: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="painel-field">
                <span>Mensalidade</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editando.valor_mensalidade}
                  onChange={(e) =>
                    setEditando((prev) => ({
                      ...prev,
                      valor_mensalidade: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="painel-field-inline">
                <input
                  type="checkbox"
                  checked={editando.destaque_home}
                  onChange={(e) =>
                    setEditando((prev) => ({
                      ...prev,
                      destaque_home: e.target.checked,
                    }))
                  }
                />
                <span>Barbearia em destaque na home</span>
              </label>

              <label className="painel-field painel-field-full">
                <span>Observacoes internas</span>
                <textarea
                  rows="5"
                  value={editando.observacoes_admin}
                  onChange={(e) =>
                    setEditando((prev) => ({
                      ...prev,
                      observacoes_admin: e.target.value,
                    }))
                  }
                  placeholder="Observacoes comerciais, pagamento, negociacao ou suporte..."
                />
              </label>

              <div className="painel-form-actions">
                <button
                  type="submit"
                  className="painel-primary-button"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="painel-empty-state">
              Escolha uma barbearia na lista para gerenciar o acesso e a
              assinatura.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
