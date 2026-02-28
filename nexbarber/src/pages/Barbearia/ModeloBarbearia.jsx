import { useParams } from "react-router-dom";
import { barbeariaExemplo } from "../../data/mockBarbearia";
import "../../styles/barbearia.css";
import ServiceCard from "../../components/ServiceCard";
import BarberCard from "../../components/BarberCard";

export default function ModeloBarbearia() {
  const { id } = useParams();

  // 🔥 Simulação: por enquanto sempre retorna o mesmo mock
  // Depois vamos buscar pelo ID
  const data = barbeariaExemplo;

  if (!data) {
    return <div style={{ color: "white" }}>Barbearia não encontrada</div>;
  }

  return (
    <div className="barbearia-page">
      {/* HERO */}
      <section className="barbearia-hero">
        <h1>
          {data.nome} #{id}
        </h1>
        <p>
          ⭐ {data.avaliacao} • {data.aberta ? "Aberto agora" : "Fechado"}
        </p>
        <button className="btn-agendar">Agendar Horário</button>
      </section>

      {/* SERVIÇOS */}
      <section className="barbearia-servicos">
        <h2>Modelos de Corte</h2>

        <div className="servicos-grid">
          {data.servicos.map((servico) => (
            <ServiceCard key={servico.id} servico={servico} />
          ))}
        </div>
      </section>

      {/* BARBEIROS */}
      <section className="barbearia-barbeiros">
        <h2>Escolha o Barbeiro</h2>

        <div className="barbeiros-grid">
          {data.barbeiros.map((barbeiro) => (
            <BarberCard key={barbeiro.id} barbeiro={barbeiro} />
          ))}
        </div>
      </section>
    </div>
  );
}
