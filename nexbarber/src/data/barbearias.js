import DonBigode from "../assets/Donbigode.png";

export const barbeariasData = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  nome: `Barbearia Premium ${i + 1}`,
  cidade: "São Paulo - SP",
  avaliacao: 4.5 + (i % 5) * 0.1,
  preco: "$$ Médio",
  aberto: i % 3 !== 0,
  logo: DonBigode,
}));
