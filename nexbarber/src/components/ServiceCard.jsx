import "../styles/ServiceCard.css";

export default function ServiceCard({ servico }) {
  if (!servico) return null;

  return (
    <div className="service-card">
      <div className="service-image">
        <img src={servico.imagem} alt={servico.nome} />

        <div className="service-badge">{servico.categoria?.join(" / ")}</div>
      </div>

      <div className="service-body">
        <h3>{servico.nome}</h3>

        <div className="service-info">
          <span>{servico.duracao} min</span>
          <span className="price">R$ {servico.preco}</span>
        </div>

        <button className="service-button">Selecionar</button>
      </div>
    </div>
  );
}
