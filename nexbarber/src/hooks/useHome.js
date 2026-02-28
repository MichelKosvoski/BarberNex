import { useState } from "react";
import DonBigode from "../assets/Donbigode.png";

export function useHome() {
  const [preco, setPreco] = useState(120);
  const [searchServico, setSearchServico] = useState("");
  const [pagina, setPagina] = useState(1);

  const itensPorPagina = 20;

  const barbearias = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    nome: `Barbearia Premium ${i + 1}`,
    cidade: "São Paulo - SP",
    avaliacao: 4.5 + (i % 5) * 0.1,
    preco: "$$ Médio",
    aberto: i % 3 !== 0,
    logo: DonBigode,
  }));

  const barbeariasPaginadas = barbearias.slice(0, pagina * itensPorPagina);

  const servicos = [
    { nome: "Corte", total: 63 },
    { nome: "Degradê", total: 62 },
    { nome: "Barba", total: 63 },
    { nome: "Sobrancelha", total: null },
    { nome: "Pigmentação", total: null },
    { nome: "Kids", total: null },
  ];

  const servicosFiltrados = servicos.filter((s) =>
    s.nome.toLowerCase().includes(searchServico.toLowerCase()),
  );

  return {
    preco,
    setPreco,
    searchServico,
    setSearchServico,
    pagina,
    setPagina,
    barbearias,
    barbeariasPaginadas,
    servicosFiltrados,
  };
}
