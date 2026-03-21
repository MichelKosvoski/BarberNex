import Banercard from "../assets/Banercard1.png";
import Donbigode from "../assets/Donbigode.png";
import Lowfade from "../assets/Lowfade.png";
import Degrade from "../assets/Degrade.png";
import Barbermodel from "../assets/Barbermodel.png";

export const barbeariaExemplo = {
  id: 1,
  nome: "Don Bigode Barbearia",
  avaliacao: 4.9,
  aberto: true,
  cidade: "São Paulo",
  uf: "SP",
  telefone: "(11) 99999-9999",
  horario: "Seg - Sáb 09:00 às 19:00",

  banner: Banercard,
  logo: Donbigode,

  // ===============================
  // SERVIÇOS COM CATEGORIA
  // ===============================
  servicos: [
    {
      id: 1,
      nome: "Low Fade",
      duracao: 30,
      preco: 45,
      imagem: Lowfade,
      categoria: ["corte"],
    },
    {
      id: 2,
      nome: "Degradê Clássico",
      duracao: 30,
      preco: 45,
      imagem: Degrade,
      categoria: ["corte"],
    },
    {
      id: 3,
      nome: "Corte + Barba",
      duracao: 45,
      preco: 75,
      imagem: Lowfade,
      categoria: ["corte", "barba"],
    },
    {
      id: 4,
      nome: "Barba Completa",
      duracao: 25,
      preco: 35,
      imagem: Lowfade,
      categoria: ["barba"],
    },
    {
      id: 5,
      nome: "Sobrancelha",
      duracao: 15,
      preco: 20,
      imagem: Lowfade,
      categoria: ["sobrancelha"],
    },
    {
      id: 6,
      nome: "Pintura Platinado",
      duracao: 90,
      preco: 150,
      imagem: Lowfade,
      categoria: ["pintura"],
    },

    // NOVOS 6 ↓↓↓

    {
      id: 7,
      nome: "Mid Fade",
      duracao: 30,
      preco: 50,
      imagem: Degrade,
      categoria: ["corte"],
    },
    {
      id: 8,
      nome: "Taper Fade",
      duracao: 30,
      preco: 45,
      imagem: Degrade,
      categoria: ["corte"],
    },
    {
      id: 9,
      nome: "Corte Social",
      duracao: 25,
      preco: 40,
      imagem: Lowfade,
      categoria: ["corte"],
    },
    {
      id: 10,
      nome: "Barba + Toalha Quente",
      duracao: 30,
      preco: 55,
      imagem: Lowfade,
      categoria: ["barba"],
    },
    {
      id: 11,
      nome: "Luzes Masculinas",
      duracao: 120,
      preco: 180,
      imagem: Lowfade,
      categoria: ["pintura"],
    },
    {
      id: 12,
      nome: "Platinado Completo",
      duracao: 150,
      preco: 220,
      imagem: Lowfade,
      categoria: ["pintura"],
    },
  ],

  // ===============================
  // BARBEIROS
  // ===============================
  barbeiros: [
    {
      id: 1,
      nome: "Lucas Pereira",
      cargo: "Especialista",
      imagem: Barbermodel,
      rating: 5,
    },
    {
      id: 2,
      nome: "Rafael Borges",
      cargo: "Especialista",
      imagem: Barbermodel,
      rating: 4,
    },
    {
      id: 3,
      nome: "Adrian",
      cargo: "Especialista",
      imagem: Barbermodel,
      rating: 4,
    },
  ],
};
