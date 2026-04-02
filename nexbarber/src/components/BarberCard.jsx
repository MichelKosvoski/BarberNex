import "../styles/BarberCard.css";
import BarberModel from "../assets/Barbermodel.png";
import { useLocale } from "../context/LocaleContext";

function resolveBarberPhoto(photo) {
  if (!photo) return BarberModel;
  if (String(photo).startsWith("data:") || String(photo).startsWith("http")) {
    return photo;
  }
  return BarberModel;
}

export default function BarberCard({ barbeiro, selected, onSelect }) {
  const { language } = useLocale();
  if (!barbeiro) return null;
  const rating = barbeiro.rating ?? 5;
  const copy =
    language === "es"
      ? { specialist: "Especialista", select: "Seleccionar", selected: "Seleccionado", imageAlt: "Barbero" }
      : language === "en"
        ? { specialist: "Specialist", select: "Select", selected: "Selected", imageAlt: "Barber" }
        : { specialist: "Especialista", select: "Selecionar", selected: "Selecionado", imageAlt: "Barbeiro" };

  return (
    <div className={`bb-barber-card ${selected ? "is-selected" : ""}`}>
      <div className="bb-barber-img-wrapper">
        <img
          src={resolveBarberPhoto(barbeiro.foto)}
          alt={copy.imageAlt}
          className="bb-barber-img"
        />

        <div className="bb-barber-overlay" />

        <div className="bb-barber-name-top">
          <h3>{barbeiro.nome}</h3>
          <span>{barbeiro.especialidade || copy.specialist}</span>

          <div className="bb-stars-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`bb-star ${star <= rating ? "filled" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bb-barber-footer">
        <button className="bb-barber-btn" onClick={onSelect}>
          {selected ? copy.selected : copy.select}
        </button>
      </div>
    </div>
  );
}
