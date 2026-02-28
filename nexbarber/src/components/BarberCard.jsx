import { useNavigate } from "react-router-dom";

export default function BarberCard({ barbearia }) {
  const navigate = useNavigate();

  return (
    <div className="barbearia-card">
      <img src={barbearia.imagem} alt={barbearia.nome} />
      <h3>{barbearia.nome}</h3>

      <button onClick={() => navigate(`/barbearia/${barbearia.id}`)}>
        Entrar
      </button>
    </div>
  );
}
