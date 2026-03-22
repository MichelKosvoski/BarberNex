import "../styles/ServiceCard.css";
import { resolveServiceImage } from "../data/mediaLibrary";

export default function ServiceCard({ servico, selected, onSelect }) {
  if (!servico) return null;

  const categorias = Array.isArray(servico.categoria)
    ? servico.categoria
    : servico.categoria
      ? [servico.categoria]
      : [];

  return (
    <div className={`service-card ${selected ? "is-selected" : ""}`}>
      <div className="service-image">
        <img src={resolveServiceImage(servico.imagem)} alt={servico.nome} />

        <div className="service-badge">
          {categorias.length > 0 ? categorias.join(" / ") : "Servico"}
        </div>
      </div>

      <div className="service-body">
        <h3>{servico.nome}</h3>

        <div className="service-info">
          <span>{servico.duracao || servico.duracao_minutos} min</span>
          <span className="price">R$ {servico.preco}</span>
        </div>

        <button className="service-button" onClick={onSelect}>
          {selected ? "Selecionado" : "Selecionar"}
        </button>
      </div>
    </div>
  );
}
