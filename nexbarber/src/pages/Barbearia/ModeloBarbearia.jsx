import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import "../../styles/barbearia.css";
import ServiceCard from "../../components/ServiceCard";
import BarberCard from "../../components/BarberCard";
import { barbeariaExemplo } from "../../data/mockBarbearia";

export default function ModeloBarbearia() {
  const { id } = useParams();

  const data = barbeariaExemplo;

  const estaAberto = data?.aberto ?? data?.aberta ?? false;

  const [tab, setTab] = useState("agendamento");
  const [diaSelecionado, setDiaSelecionado] = useState(0);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [busca, setBusca] = useState("");
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [ordenacao, setOrdenacao] = useState("az");

  // ===============================
  // 🔥 GERA 60 DIAS A PARTIR DE HOJE
  // ===============================
  const dias = useMemo(() => {
    const hoje = new Date();
    const lista = [];
    const semana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

    for (let i = 0; i < 60; i++) {
      const novaData = new Date();
      novaData.setDate(hoje.getDate() + i);

      lista.push({
        label: i === 0 ? "HOJE" : semana[novaData.getDay()],
        dia: novaData.getDate(),
        mes: novaData.getMonth(),
        ano: novaData.getFullYear(),
        completa: novaData,
      });
    }

    return lista;
  }, []);

  // ===============================
  // 🔥 HORÁRIOS FIXOS
  // ===============================
  const horarios = [
    "09:00",
    "09:30",
    "10:00",
    "11:30",
    "12:30",
    "13:30",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
  ];

  // ===============================
  // 🔥 BLOQUEIA HORÁRIOS PASSADOS SE FOR HOJE
  // ===============================
  const horarioEstaDisponivel = (hora) => {
    const hoje = new Date();
    const diaEscolhido = dias[diaSelecionado];

    if (!diaEscolhido) return true;

    const ehHoje =
      diaEscolhido.dia === hoje.getDate() &&
      diaEscolhido.mes === hoje.getMonth() &&
      diaEscolhido.ano === hoje.getFullYear();

    if (!ehHoje) return true;

    const [h, m] = hora.split(":");
    const horaComparar = new Date();
    horaComparar.setHours(Number(h));
    horaComparar.setMinutes(Number(m));
    horaComparar.setSeconds(0);

    return horaComparar > hoje;
  };
  const toggleCategoria = (categoria) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(categoria)
        ? prev.filter((c) => c !== categoria)
        : [...prev, categoria],
    );
  };

  const categoriasDisponiveis = [
    ...new Set(data.servicos.flatMap((s) => s.categoria)),
  ];

  const servicosFiltrados = useMemo(() => {
    if (!data?.servicos) return [];

    let lista = [...data.servicos];

    if (busca.trim() !== "") {
      lista = lista.filter((s) =>
        s.nome.toLowerCase().includes(busca.toLowerCase()),
      );
    }

    if (categoriasSelecionadas.length > 0) {
      lista = lista.filter((s) =>
        categoriasSelecionadas.some((cat) => s.categoria.includes(cat)),
      );
    }

    if (ordenacao === "az") {
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
    } else {
      lista.sort((a, b) => b.nome.localeCompare(a.nome));
    }

    return lista;
  }, [busca, categoriasSelecionadas, ordenacao, data]);
  const irPara = (alvoId) => {
    const el = document.getElementById(alvoId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (!data) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        Barbearia não encontrada (id: {id})
      </div>
    );
  }

  return (
    <div className="barbearia-page">
      {/* ================= HERO ================= */}
      <section
        className="bb-hero"
        style={{ backgroundImage: `url(${data?.banner || ""})` }}
      >
        <div className="bb-hero-overlay" />

        <div className="bb-hero-content">
          <div className="bb-brand">
            <div className="bb-logoBox">
              {data?.logo ? (
                <img src={data.logo} alt="logo" />
              ) : (
                <div className="bb-logoFake" />
              )}
            </div>

            <div>
              <h1 className="bb-title">{data?.nome}</h1>

              <div className="bb-meta">
                <div className="bb-stars">★★★★★</div>

                <span className={`bb-badge ${estaAberto ? "open" : "closed"}`}>
                  {estaAberto ? "✓ Aberto agora" : "• Fechado"}
                </span>
              </div>
            </div>
          </div>

          <button className="bb-cta" onClick={() => irPara("sec-agendamento")}>
            Agendar Horário
          </button>
        </div>
      </section>

      {/* ================= TABS ================= */}
      <div className="bb-tabs">
        <button
          className={`bb-tab ${tab === "agendamento" ? "active" : ""}`}
          onClick={() => setTab("agendamento")}
        >
          Agendamento
        </button>
        <button
          className={`bb-tab ${tab === "servicos" ? "active" : ""}`}
          onClick={() => setTab("servicos")}
        >
          Serviços
        </button>
        <button
          className={`bb-tab ${tab === "barbeiro" ? "active" : ""}`}
          onClick={() => setTab("barbeiro")}
        >
          Escolha seu Barbeiro
        </button>
      </div>

      {/* ================= AGENDAMENTO ================= */}
      <section id="sec-agendamento" className="bb-section">
        <div className="bb-grid2">
          {/* INFOS */}
          <div className="bb-infoCard">
            <div className="bb-infoLine">
              <span className="bb-dot" /> {data?.cidade} - {data?.uf}
            </div>
            <div className="bb-infoLine">
              <span className="bb-dot" /> {data?.telefone}
            </div>
            <div className="bb-infoLine">
              <span className="bb-dot" /> {data?.horario}
            </div>
          </div>

          {/* CALENDÁRIO */}
          <div className="bb-scheduleCard">
            {/* DIAS */}
            <div className="bb-days-scroll">
              {dias.map((d, idx) => (
                <button
                  key={idx}
                  className={`bb-day ${diaSelecionado === idx ? "active" : ""}`}
                  onClick={() => {
                    setDiaSelecionado(idx);
                    setHoraSelecionada("");
                  }}
                >
                  <span className="bb-dayLabel">{d.label}</span>
                  <span className="bb-dayNum">{d.dia}</span>
                </button>
              ))}
            </div>

            {/* HORÁRIOS */}
            <div className="bb-times">
              {horarios.map((h) => {
                const disponivel = horarioEstaDisponivel(h);

                return (
                  <button
                    key={h}
                    disabled={!disponivel}
                    className={`bb-time ${
                      horaSelecionada === h ? "active" : ""
                    } ${!disponivel ? "disabled" : ""}`}
                    onClick={() => (disponivel ? setHoraSelecionada(h) : null)}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            <div className="bb-continueRow">
              <button
                className="bb-continue"
                onClick={() => {
                  if (!horaSelecionada) return alert("Selecione um horário 🙂");

                  const dia = dias[diaSelecionado];

                  alert(
                    `Agendamento: ${dia.dia}/${dia.mes + 1}/${dia.ano} às ${horaSelecionada}`,
                  );
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVIÇOS ================= */}
      <section className="bb-section">
        <h2 className="bb-h2">Serviços</h2>

        {/* FILTROS AQUI */}
        <div style={{ marginBottom: 20, display: "flex", gap: 15 }}>
          <input
            type="text"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ padding: 8 }}
          />

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            style={{ padding: 8 }}
          >
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
          <div style={{ display: "flex", gap: 15 }}>
            {categoriasDisponiveis.map((cat) => (
              <label key={cat} style={{ color: "white" }}>
                <input
                  type="checkbox"
                  checked={categoriasSelecionadas.includes(cat)}
                  onChange={() => toggleCategoria(cat)}
                />{" "}
                {cat}
              </label>
            ))}
          </div>
        </div>

        <div className="bb-cardsGrid">
          {servicosFiltrados.map((servico) => (
            <ServiceCard key={servico.id} servico={servico} />
          ))}
        </div>
      </section>

      {/* ================= BARBEIROS ================= */}
      <section className="bb-section">
        <h2 className="bb-h2">Escolha o Barbeiro</h2>

        <div className="bb-cardsGrid">
          {data?.barbeiros?.map((barbeiro) => (
            <BarberCard key={barbeiro.id} barbeiro={barbeiro} />
          ))}
        </div>
      </section>
    </div>
  );
}
