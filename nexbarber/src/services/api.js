const API_URL = "http://localhost:3000/api";

/*
==============================
Buscar barbearia
==============================
*/
export async function getBarbearia(id) {
  const res = await fetch(`${API_URL}/barbearias/${id}`);
  return res.json();
}

/*
==============================
Buscar barbeiros
==============================
*/
export async function getBarbeiros(barbeariaId) {
  const res = await fetch(`${API_URL}/barbearias/${barbeariaId}/barbeiros`);
  return res.json();
}

/*
==============================
Buscar serviços
==============================
*/
export async function getServicos(barbeariaId) {
  const res = await fetch(`${API_URL}/barbearias/${barbeariaId}/servicos`);
  return res.json();
}

/*
==============================
Criar agendamento
==============================
*/
export async function criarAgendamento(dados) {
  const res = await fetch(`${API_URL}/agendamentos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  return res.json();
}
