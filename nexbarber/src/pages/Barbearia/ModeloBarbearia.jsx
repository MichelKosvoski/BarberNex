import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getBarbearia, getBarbeiros, getServicos } from "../../services/api";

import ServiceCard from "../../components/ServiceCard";
import BarberCard from "../../components/BarberCard";
import "../../styles/barbearia.css";

export default function ModeloBarbearia() {
  const { id } = useParams();

  const [tab, setTab] = useState("agendamento");
  const [diaSelecionado, setDiaSelecionado] = useState(0);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [busca, setBusca] = useState("");
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(null);
  const [buscaBarbeiro, setBuscaBarbeiro] = useState("");
  const [filtroEstrelas, setFiltroEstrelas] = useState(0);

  const [barbearia, setBarbearia] = useState(null);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const barbeariaData = await getBarbearia(id);
        const barbeirosData = await getBarbeiros(id);
        const servicosData = await getServicos(id);

        setBarbearia(barbeariaData);
        setBarbeiros(Array.isArray(barbeirosData) ? barbeirosData : []);
        setServicos(Array.isArray(servicosData) ? servicosData : []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    carregar();
  }, [id]);

  const estaAberto = barbearia?.aberto ?? barbearia?.aberta ?? false;

  const dias = useMemo(() => {
    const hoje = new Date();
    const lista = [];
    const semana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

    for (let i = 0; i < 60; i += 1) {
      const novaData = new Date(hoje);
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

  const horarioEstaDisponivel = (hora) => {
    const hoje = new Date();
    const diaEscolhido = dias[diaSelecionado];

    if (!diaEscolhido) {
      return true;
    }

    const ehHoje =
      diaEscolhido.dia === hoje.getDate() &&
      diaEscolhido.mes === hoje.getMonth() &&
      diaEscolhido.ano === hoje.getFullYear();

    if (!ehHoje) {
      return true;
    }

    const [h, m] = hora.split(":");
    const horaComparar = new Date();
    horaComparar.setHours(Number(h), Number(m), 0, 0);

    return horaComparar > hoje;
  };

  const toggleCategoria = (categoria) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(categoria)
        ? prev.filter((item) => item !== categoria)
        : [...prev, categoria],
    );
  };

  const categoriasDisponiveis = useMemo(
    () =>
      [
        ...new Set(servicos.flatMap((servico) => servico.categoria || [])),
      ].filter(Boolean),
    [servicos],
  );

  const servicosFiltrados = useMemo(() => {
    let lista = [...servicos];

    if (busca.trim()) {
      lista = lista.filter((servico) =>
        servico.nome?.toLowerCase().includes(busca.toLowerCase()),
      );
    }

    if (categoriasSelecionadas.length > 0) {
      lista = lista.filter((servico) =>
        categoriasSelecionadas.some((categoria) =>
          (servico.categoria || []).includes(categoria),
        ),
      );
    }

    return lista;
  }, [busca, categoriasSelecionadas, servicos]);

  const barbeirosFiltrados = useMemo(() => {
    let lista = [...barbeiros];

    if (buscaBarbeiro.trim()) {
      lista = lista.filter((barbeiro) =>
        barbeiro.nome?.toLowerCase().includes(buscaBarbeiro.toLowerCase()),
      );
    }

    if (filtroEstrelas > 0) {
      lista = lista.filter(
        (barbeiro) => Number(barbeiro.rating ?? 5) >= filtroEstrelas,
      );
    }

    return lista;
  }, [barbeiros, buscaBarbeiro, filtroEstrelas]);

  const irPara = (alvoId) => {
    const el = document.getElementById(alvoId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!barbearia) {
    return <div>Carregando barbearia...</div>;
  }

  return (
    <div className="barbearia-page">
      <section
        className="bb-hero"
        style={{ backgroundImage: `url(${barbearia?.banner || ""})` }}
      >
        <div className="bb-hero-overlay" />

        <div className="bb-hero-content">
          <div className="bb-brand">
            <div className="bb-logoBox">
              {barbearia?.logo ? (
                <img src={barbearia.logo} alt="logo" />
              ) : (
                <div className="bb-logoFake" />
              )}
            </div>

            <div>
              <h1 className="bb-title">{barbearia?.nome}</h1>

              <div className="bb-meta">
                <div className="bb-stars">★★★★★</div>

                <span className={`bb-badge ${estaAberto ? "open" : "closed"}`}>
                  {estaAberto ? "Aberto agora" : "Fechado"}
                </span>
              </div>
            </div>
          </div>

          <button className="bb-cta" onClick={() => irPara("sec-agendamento")}>
            Agendar Horário
          </button>
        </div>
      </section>

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

      <section id="sec-agendamento" className="bb-section">
        <div className="bb-grid2">
          <div className="bb-infoCard">
            <div className="bb-infoLine">
              <span className="bb-dot" /> {barbearia?.cidade} - {barbearia?.uf}
            </div>
            <div className="bb-infoLine">
              <span className="bb-dot" /> {barbearia?.telefone}
            </div>
            <div className="bb-infoLine">
              <span className="bb-dot" /> {barbearia?.horario}
            </div>
          </div>

          <div className="bb-scheduleCard">
            <div className="bb-days-scroll">
              {dias.map((dia, idx) => (
                <button
                  key={`${dia.ano}-${dia.mes}-${dia.dia}`}
                  className={`bb-day ${diaSelecionado === idx ? "active" : ""}`}
                  onClick={() => {
                    setDiaSelecionado(idx);
                    setHoraSelecionada("");
                  }}
                >
                  <span className="bb-dayLabel">{dia.label}</span>
                  <span className="bb-dayNum">{dia.dia}</span>
                </button>
              ))}
            </div>

            <div className="bb-times">
              {horarios.map((hora) => {
                const disponivel = horarioEstaDisponivel(hora);

                return (
                  <button
                    key={hora}
                    disabled={!disponivel}
                    className={`bb-time ${
                      horaSelecionada === hora ? "active" : ""
                    } ${!disponivel ? "disabled" : ""}`}
                    onClick={() => {
                      if (disponivel) {
                        setHoraSelecionada(hora);
                      }
                    }}
                  >
                    {hora}
                  </button>
                );
              })}
            </div>

            <div className="bb-continueRow">
              <button
                className="bb-continue"
                onClick={() => {
                  if (!horaSelecionada) {
                    alert("Selecione um horário");
                    return;
                  }

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

      <section className="bb-section">
        <h2 className="bb-h2">Serviços</h2>

        <div className="bb-filtros">
          <input
            type="text"
            placeholder="Buscar serviço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bb-input-busca"
          />

          <div className="bb-categorias">
            {categoriasDisponiveis.map((categoria) => (
              <label key={categoria} className="bb-categoria-item">
                <input
                  type="checkbox"
                  checked={categoriasSelecionadas.includes(categoria)}
                  onChange={() => toggleCategoria(categoria)}
                />
                <span>{categoria}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bb-cardsGrid">
          {servicosFiltrados.map((servico) => (
            <ServiceCard
              key={servico.id}
              servico={servico}
              selected={servicoSelecionado?.id === servico.id}
              onSelect={() => setServicoSelecionado(servico)}
            />
          ))}
        </div>
      </section>

      <section id="sec-barbeiros" className="bb-section">
        <div className="bb-barbeiro-top">
          <h3 className="bb-h3">Escolha seu Barbeiro</h3>

          <div className="bb-barbeiro-filtros">
            <input
              type="text"
              placeholder="Buscar barbeiro..."
              value={buscaBarbeiro}
              onChange={(e) => setBuscaBarbeiro(e.target.value)}
              className="bb-input-busca"
            />

            <select
              value={filtroEstrelas}
              onChange={(e) => setFiltroEstrelas(Number(e.target.value))}
              className="bb-select-estrelas"
            >
              <option value={0}>Todas avaliações</option>
              <option value={5}>★★★★★</option>
              <option value={4}>★★★★+</option>
              <option value={3}>★★★+</option>
            </select>
          </div>
        </div>

        <div className="bb-barbeiros-layout">
          <div className="bb-barbeiros-grid">
            {barbeirosFiltrados.map((barbeiro) => (
              <BarberCard
                key={barbeiro.id}
                barbeiro={barbeiro}
                selected={barbeiroSelecionado?.id === barbeiro.id}
                onSelect={() => setBarbeiroSelecionado(barbeiro)}
              />
            ))}
          </div>

          <div className="bb-resumo-lateral">
            <h3 className="bb-resumo-titulo">Resumo do Agendamento</h3>

            <div className="bb-resumo-item">
              <span>Serviço</span>
              <strong>
                {servicoSelecionado
                  ? servicoSelecionado.nome
                  : "Não selecionado"}
              </strong>
            </div>

            <div className="bb-resumo-item">
              <span>Data</span>
              <strong>
                {horaSelecionada
                  ? `${dias[diaSelecionado].dia}/${dias[diaSelecionado].mes + 1}`
                  : "Não selecionado"}
              </strong>
            </div>

            <div className="bb-resumo-item">
              <span>Horário</span>
              <strong>{horaSelecionada || "Não selecionado"}</strong>
            </div>

            <div className="bb-resumo-item">
              <span>Barbeiro</span>
              <strong>
                {barbeiroSelecionado
                  ? barbeiroSelecionado.nome
                  : "Não selecionado"}
              </strong>
            </div>

            <div className="bb-campo">
              <label>Tipo de cliente</label>
              <select className="bb-select">
                <option>Adulto</option>
                <option>Criança</option>
              </select>
            </div>

            <div className="bb-campo">
              <label>Forma de pagamento</label>
              <select className="bb-select">
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Cartão Débito</option>
                <option>Cartão Crédito</option>
              </select>
            </div>

            <div className="bb-campo">
              <label>Observação</label>
              <textarea
                className="bb-textarea"
                placeholder="Ex: Deixar mais baixo na lateral..."
              />
            </div>

            <div className="bb-total">
              <span>Total</span>
              <strong>
                {servicoSelecionado ? `R$ ${servicoSelecionado.preco}` : "R$ 0"}
              </strong>
            </div>

            <button
              className="bb-btn-confirmar"
              disabled={!servicoSelecionado || !horaSelecionada}
            >
              Confirmar Agendamento
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
