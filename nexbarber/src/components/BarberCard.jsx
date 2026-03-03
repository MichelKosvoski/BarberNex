import "../styles/BarberCard.css";
import BarberModel from "../assets/Barbermodel.png";

export default function BarberCard({ barbeiro }) {
  if (!barbeiro) return null;

  // 🔥 Nota exemplo (se não existir no mock, usa 5)
  const rating = barbeiro.rating ?? 5;

  return (
    <div className="bb-barber-card">
      <div className="bb-barber-img-wrapper">
        <img src={BarberModel} alt="Barbeiro" className="bb-barber-img" />

        <div className="bb-barber-overlay" />

        <div className="bb-barber-name-top">
          <h3>{barbeiro.nome}</h3>
          <span>{barbeiro.especialidade || "Especialista"}</span>

          {/* ⭐ ESTRELAS */}
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
        <button className="bb-barber-btn">Selecionar</button>
      </div>
    </div>
  );
}
