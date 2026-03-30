import { useEffect, useMemo, useState } from "react";
import {
  createMasterUsuario,
  getMasterBarbearias,
  getMasterUsuarios,
  updateMasterUsuario,
} from "../../services/api";

const initialForm = {
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  senha: "",
  tipo: "funcionario",
  status: "ativo",
  barbearia_id: "",
};

const initialEdit = {
  id: null,
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  senha: "",
  tipo: "funcionario",
  status: "ativo",
  barbearia_id: "",
};

export default function MasterUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [barbearias, setBarbearias] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroBarbearia, setFiltroBarbearia] = useState("");
  const [cadastro, setCadastro] = useState(initialForm);
  const [editando, setEditando] = useState(initialEdit);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [salvandoNovo, setSalvandoNovo] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  async function carregarUsuarios(filters = {}) {
    try {
      const resposta = await getMasterUsuarios(filters);
      setUsuarios(Array.isArray(resposta) ? resposta : []);
    } catch (error) {
      setErro(error.message);
    }
  }

  async function carregarBarbearias() {
    try {
      const resposta = await getMasterBarbearias();
      setBarbearias(Array.isArray(resposta) ? resposta : []);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarUsuarios();
    carregarBarbearias();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarUsuarios({
        search: busca,
        tipo: filtroTipo,
        status: filtroStatus,
        barbearia_id: filtroBarbearia,
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [busca, filtroTipo, filtroStatus, filtroBarbearia]);

  const resumo = useMemo(
    () => ({
      total: usuarios.length,
      ativos: usuarios.filter((item) => item.status === "ativo").length,
      funcionarios: usuarios.filter((item) => item.tipo === "funcionario").length,
      masters: usuarios.filter((item) => item.tipo === "master").length,
    }),
    [usuarios],
  );

  const usuariosFiltrados = useMemo(() => usuarios, [usuarios]);

  const tipoCadastroPrecisaBarbearia = cadastro.tipo !== "master";
  const tipoEdicaoPrecisaBarbearia = editando.tipo !== "master";

  const iniciarEdicao = (usuario) => {
    setErro("");
    setFeedback("");
    setEditando({
      id: usuario.id,
      nome: usuario.nome || "",
      email: usuario.email || "",
      telefone: usuario.telefone || "",
      cpf: usuario.cpf || "",
      senha: "",
      tipo: usuario.tipo || "funcionario",
      status: usuario.status || "ativo",
      barbearia_id: usuario.barbearia_id ? String(usuario.barbearia_id) : "",
    });
  };

  const salvarNovo = async (event) => {
    event.preventDefault();

    try {
      setErro("");
      setFeedback("");
      setSalvandoNovo(true);

      await createMasterUsuario({
        ...cadastro,
        barbearia_id: tipoCadastroPrecisaBarbearia ? Number(cadastro.barbearia_id) : null,
      });

      setFeedback("Usuario cadastrado com sucesso.");
      setCadastro(initialForm);
      await carregarUsuarios({
        search: busca,
        tipo: filtroTipo,
        status: filtroStatus,
        barbearia_id: filtroBarbearia,
      });
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvandoNovo(false);
    }
  };

  const salvarEdicao = async (event) => {
    event.preventDefault();
    if (!editando.id) return;

    try {
      setErro("");
      setFeedback("");
      setSalvandoEdicao(true);

      await updateMasterUsuario(editando.id, {
        nome: editando.nome,
        email: editando.email,
        telefone: editando.telefone,
        cpf: editando.cpf,
        senha: editando.senha || undefined,
        tipo: editando.tipo,
        status: editando.status,
        barbearia_id: tipoEdicaoPrecisaBarbearia ? Number(editando.barbearia_id) : null,
      });

      setFeedback("Usuario atualizado com sucesso.");
      setEditando(initialEdit);
      await carregarUsuarios({
        search: busca,
        tipo: filtroTipo,
        status: filtroStatus,
        barbearia_id: filtroBarbearia,
      });
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvandoEdicao(false);
    }
  };

  return (
    <section className="painel-content">
      <div className="painel-hero painel-hero-compact">
        <div>
          <p className="painel-eyebrow">Usuarios da plataforma</p>
          <h3>
            Cadastre funcionarios, donos ou acessos master e vincule cada conta
            a uma barbearia sem depender do registro publico.
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
          <strong className="painel-stat-value">{resumo.total}</strong>
          <p className="painel-stat-detail">Usuarios cadastrados</p>
        </article>

        <article className="painel-stat-card painel-accent-green">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Ativos</span>
          </div>
          <strong className="painel-stat-value">{resumo.ativos}</strong>
          <p className="painel-stat-detail">Acessos liberados</p>
        </article>

        <article className="painel-stat-card painel-accent-gold">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Funcionarios</span>
          </div>
          <strong className="painel-stat-value">{resumo.funcionarios}</strong>
          <p className="painel-stat-detail">Equipe operacional</p>
        </article>

        <article className="painel-stat-card painel-accent-default">
          <div className="painel-stat-top">
            <span className="painel-stat-title">Masters</span>
          </div>
          <strong className="painel-stat-value">{resumo.masters}</strong>
          <p className="painel-stat-detail">Acessos da plataforma</p>
        </article>
      </div>

      <div className="painel-grid painel-grid-main">
        <section className="painel-card">
          <div className="painel-card-header">
            <div>
              <h4>Usuarios cadastrados</h4>
              <p>Filtre por perfil, status ou barbearia</p>
            </div>
          </div>

          <div className="painel-table-toolbar">
            <input
              className="painel-search"
              placeholder="Buscar por nome, email, telefone ou barbearia"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              className="painel-toolbar-select"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos os perfis</option>
              <option value="funcionario">Funcionario</option>
              <option value="dono">Dono</option>
              <option value="master">Master</option>
            </select>

            <select
              className="painel-toolbar-select"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>

            <select
              className="painel-toolbar-select"
              value={filtroBarbearia}
              onChange={(e) => setFiltroBarbearia(e.target.value)}
            >
              <option value="">Todas as barbearias</option>
              <option value="sem-barbearia">Sem barbearia</option>
              {barbearias.map((barbearia) => (
                <option key={barbearia.id} value={barbearia.id}>
                  {barbearia.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="painel-table-wrap">
            <table className="painel-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Perfil</th>
                  <th>Barbearia</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <strong>{usuario.nome}</strong>
                        <div className="painel-cell-copy">{usuario.email}</div>
                        <div className="painel-cell-copy">
                          {usuario.telefone || "Sem telefone"}
                        </div>
                      </td>
                      <td>{usuario.tipo}</td>
                      <td>
                        <strong>{usuario.barbearia_nome || "Nao vinculada"}</strong>
                        <div className="painel-cell-copy">
                          {usuario.tipo === "master"
                            ? "Acesso da plataforma"
                            : usuario.plano || "Sem plano"}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`painel-status-chip is-${usuario.status || "ativo"}`}
                        >
                          {usuario.status || "ativo"}
                        </span>
                      </td>
                      <td>
                        <div className="painel-table-actions">
                          <button
                            type="button"
                            className="painel-table-btn is-primary"
                            onClick={() => iniciarEdicao(usuario)}
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="painel-empty-cell">
                      Nenhum usuario encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="painel-info-stack">
          <section className="painel-card">
            <div className="painel-card-header">
              <div>
                <h4>Novo usuario</h4>
                <p>Crie acesso direto pelo master</p>
              </div>
            </div>

            <form className="painel-form-grid" onSubmit={salvarNovo}>
              <label className="painel-field">
                <span>Nome</span>
                <input
                  value={cadastro.nome}
                  onChange={(e) =>
                    setCadastro((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  placeholder="Nome completo"
                />
              </label>

              <label className="painel-field">
                <span>Email</span>
                <input
                  type="email"
                  value={cadastro.email}
                  onChange={(e) =>
                    setCadastro((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@exemplo.com"
                />
              </label>

              <label className="painel-field">
                <span>Telefone</span>
                <input
                  value={cadastro.telefone}
                  onChange={(e) =>
                    setCadastro((prev) => ({ ...prev, telefone: e.target.value }))
                  }
                  placeholder="(65) 99999-9999"
                />
              </label>

              <label className="painel-field">
                <span>CPF</span>
                <input
                  value={cadastro.cpf}
                  onChange={(e) =>
                    setCadastro((prev) => ({ ...prev, cpf: e.target.value }))
                  }
                  placeholder="Opcional"
                />
              </label>

              <label className="painel-field">
                <span>Tipo</span>
                <select
                  value={cadastro.tipo}
                  onChange={(e) =>
                    setCadastro((prev) => ({
                      ...prev,
                      tipo: e.target.value,
                      barbearia_id: e.target.value === "master" ? "" : prev.barbearia_id,
                    }))
                  }
                >
                  <option value="funcionario">Funcionario</option>
                  <option value="dono">Dono</option>
                  <option value="master">Master</option>
                </select>
              </label>

              <label className="painel-field">
                <span>Status</span>
                <select
                  value={cadastro.status}
                  onChange={(e) =>
                    setCadastro((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>

              <label className="painel-field">
                <span>Senha inicial</span>
                <input
                  type="password"
                  value={cadastro.senha}
                  onChange={(e) =>
                    setCadastro((prev) => ({ ...prev, senha: e.target.value }))
                  }
                  placeholder="Crie uma senha de acesso"
                />
              </label>

              <label className="painel-field">
                <span>Barbearia</span>
                <select
                  value={cadastro.barbearia_id}
                  onChange={(e) =>
                    setCadastro((prev) => ({
                      ...prev,
                      barbearia_id: e.target.value,
                    }))
                  }
                  disabled={!tipoCadastroPrecisaBarbearia}
                >
                  <option value="">
                    {tipoCadastroPrecisaBarbearia
                      ? "Selecione a barbearia"
                      : "Nao se aplica para master"}
                  </option>
                  {barbearias.map((barbearia) => (
                    <option key={barbearia.id} value={barbearia.id}>
                      {barbearia.nome}
                    </option>
                  ))}
                </select>
              </label>

              <div className="painel-form-actions">
                <button
                  type="submit"
                  className="painel-primary-button"
                  disabled={salvandoNovo}
                >
                  {salvandoNovo ? "Cadastrando..." : "Cadastrar usuario"}
                </button>
              </div>
            </form>
          </section>

          <section className="painel-card">
            <div className="painel-card-header">
              <div>
                <h4>Edicao rapida</h4>
                <p>Atualize perfil, status e barbearia vinculada</p>
              </div>
            </div>

            {editando.id ? (
              <form className="painel-form-grid" onSubmit={salvarEdicao}>
                <div className="painel-master-selected">
                  <strong>{editando.nome}</strong>
                  <span>
                    Ajuste esse acesso sem depender de auto cadastro ou redefinicao
                    externa.
                  </span>
                </div>

                <label className="painel-field">
                  <span>Nome</span>
                  <input
                    value={editando.nome}
                    onChange={(e) =>
                      setEditando((prev) => ({ ...prev, nome: e.target.value }))
                    }
                  />
                </label>

                <label className="painel-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={editando.email}
                    onChange={(e) =>
                      setEditando((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </label>

                <label className="painel-field">
                  <span>Telefone</span>
                  <input
                    value={editando.telefone}
                    onChange={(e) =>
                      setEditando((prev) => ({ ...prev, telefone: e.target.value }))
                    }
                  />
                </label>

                <label className="painel-field">
                  <span>CPF</span>
                  <input
                    value={editando.cpf}
                    onChange={(e) =>
                      setEditando((prev) => ({ ...prev, cpf: e.target.value }))
                    }
                  />
                </label>

                <label className="painel-field">
                  <span>Tipo</span>
                  <select
                    value={editando.tipo}
                    onChange={(e) =>
                      setEditando((prev) => ({
                        ...prev,
                        tipo: e.target.value,
                        barbearia_id: e.target.value === "master" ? "" : prev.barbearia_id,
                      }))
                    }
                  >
                    <option value="funcionario">Funcionario</option>
                    <option value="dono">Dono</option>
                    <option value="master">Master</option>
                  </select>
                </label>

                <label className="painel-field">
                  <span>Status</span>
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
                  <span>Nova senha</span>
                  <input
                    type="password"
                    value={editando.senha}
                    onChange={(e) =>
                      setEditando((prev) => ({ ...prev, senha: e.target.value }))
                    }
                    placeholder="Preencha somente se quiser trocar"
                  />
                </label>

                <label className="painel-field">
                  <span>Barbearia</span>
                  <select
                    value={editando.barbearia_id}
                    onChange={(e) =>
                      setEditando((prev) => ({
                        ...prev,
                        barbearia_id: e.target.value,
                      }))
                    }
                    disabled={!tipoEdicaoPrecisaBarbearia}
                  >
                    <option value="">
                      {tipoEdicaoPrecisaBarbearia
                        ? "Selecione a barbearia"
                        : "Nao se aplica para master"}
                    </option>
                    {barbearias.map((barbearia) => (
                      <option key={barbearia.id} value={barbearia.id}>
                        {barbearia.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="painel-form-actions">
                  <button
                    type="button"
                    className="painel-secondary-button"
                    onClick={() => setEditando(initialEdit)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="painel-primary-button"
                    disabled={salvandoEdicao}
                  >
                    {salvandoEdicao ? "Salvando..." : "Salvar usuario"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="painel-empty-state">
                Escolha um usuario na lista para editar dados, perfil ou status.
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
