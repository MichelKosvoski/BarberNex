import "../styles/ServiceCard.css";
export default function ServiceCard({ servico }) {
  return (
    <div className="service-card">
      <img src={servico.imagem} alt={servico.nome} />
      <h3>{servico.nome}</h3>
      <p>{servico.duracao} min</p>
      <p>R$ {servico.preco}</p>
      <button>Selecionar</button>
    </div>
  );
}
