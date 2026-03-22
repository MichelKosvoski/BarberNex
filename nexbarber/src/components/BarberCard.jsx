import "../styles/BarberCard.css";
import BarberModel from "../assets/Barbermodel.png";

function resolveBarberPhoto(photo) {
  if (!photo) return BarberModel;
  if (String(photo).startsWith("data:") || String(photo).startsWith("http")) {
    return photo;
  }
  return BarberModel;
}

export default function BarberCard({ barbeiro, selected, onSelect }) {
  if (!barbeiro) return null;

  const rating = barbeiro.rating ?? 5;

  return (
    <div className={`bb-barber-card ${selected ? "is-selected" : ""}`}>
      <div className="bb-barber-img-wrapper">
        <img
          src={resolveBarberPhoto(barbeiro.foto)}
          alt="Barbeiro"
          className="bb-barber-img"
        />

        <div className="bb-barber-overlay" />

        <div className="bb-barber-name-top">
          <h3>{barbeiro.nome}</h3>
          <span>{barbeiro.especialidade || "Especialista"}</span>

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
          {selected ? "Selecionado" : "Selecionar"}
        </button>
      </div>
    </div>
  );
}
