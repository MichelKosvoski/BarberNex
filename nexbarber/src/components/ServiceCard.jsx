import "../styles/ServiceCard.css";
import { resolveServiceImage } from "../data/mediaLibrary";
import { useLocale } from "../context/LocaleContext";

export default function ServiceCard({ servico, selected, onSelect }) {
  const { language, formatCurrencyFromBrl } = useLocale();
  if (!servico) return null;

  const copy =
    language === "es"
      ? { defaultBadge: "Servicio", minutes: "min", select: "Seleccionar", selected: "Seleccionado" }
      : language === "en"
        ? { defaultBadge: "Service", minutes: "min", select: "Select", selected: "Selected" }
        : { defaultBadge: "Servico", minutes: "min", select: "Selecionar", selected: "Selecionado" };

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
          {categorias.length > 0 ? categorias.join(" / ") : copy.defaultBadge}
        </div>
      </div>

      <div className="service-body">
        <h3>{servico.nome}</h3>

        <div className="service-info">
          <span>{servico.duracao || servico.duracao_minutos} {copy.minutes}</span>
          <span className="price">{formatCurrencyFromBrl(servico.preco)}</span>
        </div>

        <button className="service-button" onClick={onSelect}>
          {selected ? copy.selected : copy.select}
        </button>
      </div>
    </div>
  );
}
