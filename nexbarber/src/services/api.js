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

export async function getAgendamentosPainel(barbeariaId) {
  return fetchJson(`${API_URL}/agendamentos/barbearia/${barbeariaId}`);
}

export async function getClientesPainel(barbeariaId) {
  return fetchJson(`${API_URL}/clientes/barbearia/${barbeariaId}`);
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
