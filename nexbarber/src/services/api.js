const API_URL = "http://localhost:3000/api";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    let message = "Erro ao carregar dados";

    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      message = `Erro ${res.status}`;
    }

    throw new Error(message);
  }

  return res.json();
}

export function getPainelBarbeariaId() {
  return localStorage.getItem("barbeariaId") || "1";
}

export function getSessionUser() {
  const raw = localStorage.getItem("nexbarber_user");
  return raw ? JSON.parse(raw) : null;
}

export function getSessionPlano() {
  return String(getSessionUser()?.plano || "").trim();
}

export function getSessionPlanoCodigo() {
  return String(getSessionUser()?.plano_codigo || "").trim();
}

export function isPlanoAgenda(plano = getSessionPlano(), planoCodigo = getSessionPlanoCodigo()) {
  const codigo = String(planoCodigo || "").trim().toLowerCase();
  const nome = String(plano || "").trim().toLowerCase();

  return codigo === "agenda" || nome === "agenda" || nome === "prata";
}

export function canAccessPainelFeature(feature, plano = getSessionPlano()) {
  if (!isPlanoAgenda(plano, getSessionPlanoCodigo())) {
    return true;
  }

  return ["painel", "agenda", "configuracoes"].includes(feature);
}

export function setSessionUser(user) {
  localStorage.setItem("nexbarber_user", JSON.stringify(user));
  if (user?.barbearia_id) {
    localStorage.setItem("barbeariaId", String(user.barbearia_id));
  }
}

export function clearSessionUser() {
  localStorage.removeItem("nexbarber_user");
}

/*
==============================
Buscar barbearia
==============================
*/
export async function getBarbearia(id) {
  return fetchJson(`${API_URL}/barbearias/${id}`);
}

/*
==============================
Buscar barbeiros
==============================
*/
export async function getBarbeiros(barbeariaId) {
  return fetchJson(`${API_URL}/barbearias/${barbeariaId}/barbeiros`);
}

/*
==============================
Buscar serviços
==============================
*/
export async function getServicos(barbeariaId) {
  return fetchJson(`${API_URL}/barbearias/${barbeariaId}/servicos`);
}

/*
==============================
Criar agendamento
==============================
*/
export async function criarAgendamento(dados) {
  return fetchJson(`${API_URL}/agendamentos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });
}

export async function getResumoPainel(barbeariaId) {
  return fetchJson(`${API_URL}/painel/${barbeariaId}/resumo`);
}

export async function getRelatoriosPainel(barbeariaId) {
  return fetchJson(`${API_URL}/painel/${barbeariaId}/relatorios`);
}

export async function getDespesasPainel(barbeariaId) {
  return fetchJson(`${API_URL}/despesas/barbearia/${barbeariaId}`);
}

export async function createDespesa(barbeariaId, payload) {
  return fetchJson(`${API_URL}/despesas/barbearia/${barbeariaId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteDespesa(id) {
  return fetchJson(`${API_URL}/despesas/${id}`, {
    method: "DELETE",
  });
}

export async function getAgendamentosPainel(barbeariaId) {
  return fetchJson(`${API_URL}/agendamentos/barbearia/${barbeariaId}`);
}

export async function updateAgendamento(id, payload) {
  return fetchJson(`${API_URL}/agendamentos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAgendamentoStatus(id, status) {
  return fetchJson(`${API_URL}/agendamentos/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

export async function deleteAgendamento(id) {
  return fetchJson(`${API_URL}/agendamentos/${id}`, {
    method: "DELETE",
  });
}

export async function getClientesPainel(barbeariaId) {
  return fetchJson(`${API_URL}/clientes/barbearia/${barbeariaId}`);
}

export async function createCliente(barbeariaId, payload) {
  return fetchJson(`${API_URL}/clientes/barbearia/${barbeariaId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateCliente(id, payload) {
  return fetchJson(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteCliente(id) {
  return fetchJson(`${API_URL}/clientes/${id}`, {
    method: "DELETE",
  });
}

export async function getBarbeirosPainel(barbeariaId) {
  return fetchJson(`${API_URL}/barbeiros/barbearia/${barbeariaId}`);
}

export async function createBarbeiro(barbeariaId, payload) {
  return fetchJson(`${API_URL}/barbeiros/barbearia/${barbeariaId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateBarbeiro(id, payload) {
  return fetchJson(`${API_URL}/barbeiros/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteBarbeiro(id) {
  return fetchJson(`${API_URL}/barbeiros/${id}`, {
    method: "DELETE",
  });
}

export async function getServicosPainel(barbeariaId) {
  return fetchJson(`${API_URL}/servicos/barbearia/${barbeariaId}`);
}

export async function createServico(barbeariaId, payload) {
  return fetchJson(`${API_URL}/servicos/barbearia/${barbeariaId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateServico(id, payload) {
  return fetchJson(`${API_URL}/servicos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteServico(id) {
  return fetchJson(`${API_URL}/servicos/${id}`, {
    method: "DELETE",
  });
}

export async function getProdutosPainel(barbeariaId) {
  return fetchJson(`${API_URL}/produtos/barbearia/${barbeariaId}`);
}

export async function createProduto(barbeariaId, payload) {
  return fetchJson(`${API_URL}/produtos/barbearia/${barbeariaId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateProduto(id, payload) {
  return fetchJson(`${API_URL}/produtos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteProduto(id) {
  return fetchJson(`${API_URL}/produtos/${id}`, {
    method: "DELETE",
  });
}

export async function updateBarbearia(id, payload) {
  return fetchJson(`${API_URL}/barbearias/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getPlanosAssinatura(barbeariaId) {
  return fetchJson(`${API_URL}/assinaturas/barbearia/${barbeariaId}/planos`);
}

export async function createPlanoAssinatura(barbeariaId, payload) {
  return fetchJson(`${API_URL}/assinaturas/barbearia/${barbeariaId}/planos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getClientesAssinaturas(barbeariaId) {
  return fetchJson(`${API_URL}/assinaturas/barbearia/${barbeariaId}/clientes`);
}

export async function createClienteAssinatura(barbeariaId, payload) {
  return fetchJson(`${API_URL}/assinaturas/barbearia/${barbeariaId}/clientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getPdvVendas(barbeariaId) {
  return fetchJson(`${API_URL}/pdv/barbearia/${barbeariaId}/vendas`);
}

export async function getPdvVendaItens(vendaId) {
  return fetchJson(`${API_URL}/pdv/vendas/${vendaId}/itens`);
}

export async function createPdvVenda(barbeariaId, payload) {
  return fetchJson(`${API_URL}/pdv/barbearia/${barbeariaId}/vendas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return fetchJson(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload) {
  return fetchJson(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getMasterResumo(filters = {}) {
  const params = new URLSearchParams();

  if (filters.periodo) params.set("periodo", filters.periodo);
  if (filters.estado) params.set("estado", filters.estado);
  if (filters.cidade) params.set("cidade", filters.cidade);
  if (filters.dataInicio) params.set("dataInicio", filters.dataInicio);
  if (filters.dataFim) params.set("dataFim", filters.dataFim);

  const query = params.toString();
  return fetchJson(`${API_URL}/master/resumo${query ? `?${query}` : ""}`);
}

export async function getMasterBarbearias() {
  return fetchJson(`${API_URL}/master/barbearias`);
}

export async function getMasterPlanos(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  return fetchJson(`${API_URL}/master/planos${query ? `?${query}` : ""}`);
}

export async function getMasterPlanosPublicos() {
  return fetchJson(`${API_URL}/master/planos-publicos?status=ativo`);
}

export async function createMasterPlano(payload) {
  return fetchJson(`${API_URL}/master/planos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateMasterPlano(id, payload) {
  return fetchJson(`${API_URL}/master/planos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteMasterPlano(id) {
  return fetchJson(`${API_URL}/master/planos/${id}`, {
    method: "DELETE",
  });
}

export async function getMasterUsuarios(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.tipo) params.set("tipo", filters.tipo);
  if (filters.status) params.set("status", filters.status);
  if (filters.barbearia_id) params.set("barbearia_id", filters.barbearia_id);

  const query = params.toString();
  return fetchJson(`${API_URL}/master/usuarios${query ? `?${query}` : ""}`);
}

export async function createMasterUsuario(payload) {
  return fetchJson(`${API_URL}/master/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateMasterUsuario(id, payload) {
  return fetchJson(`${API_URL}/master/usuarios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateMasterBarbearia(id, payload) {
  return fetchJson(`${API_URL}/master/barbearias/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getMasterCobrancas(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.barbearia_id) params.set("barbearia_id", filters.barbearia_id);
  if (filters.search) params.set("search", filters.search);

  const query = params.toString();
  return fetchJson(`${API_URL}/master/cobrancas${query ? `?${query}` : ""}`);
}

export async function createMasterCobranca(payload) {
  return fetchJson(`${API_URL}/master/cobrancas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateMasterCobranca(id, payload) {
  return fetchJson(`${API_URL}/master/cobrancas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function createMasterCheckout(id) {
  return fetchJson(`${API_URL}/master/cobrancas/${id}/checkout`, {
    method: "POST",
  });
}

export async function deleteMasterCobranca(id) {
  return fetchJson(`${API_URL}/master/cobrancas/${id}`, {
    method: "DELETE",
  });
}
