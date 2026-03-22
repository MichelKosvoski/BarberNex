import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  criarAgendamento,
  getBarbearia,
  getBarbeiros,
  getPlanosAssinatura,
  getServicos,
} from "../../services/api";

import ServiceCard from "../../components/ServiceCard";
import BarberCard from "../../components/BarberCard";
import "../../styles/barbearia.css";

export default function ModeloBarbearia() {
  const { id } = useParams();
  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [tab, setTab] = useState("agendamento");
  const [mesAtual, setMesAtual] = useState(inicioMesAtual);
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [busca, setBusca] = useState("");
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(null);
  const [buscaBarbeiro, setBuscaBarbeiro] = useState("");
  const [filtroEstrelas, setFiltroEstrelas] = useState(0);
  const [tipoCliente, setTipoCliente] = useState("Adulto");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [observacao, setObservacao] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [salvandoAgendamento, setSalvandoAgendamento] = useState(false);

  const [barbearia, setBarbearia] = useState(null);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [planos, setPlanos] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const barbeariaData = await getBarbearia(id);
        const barbeirosData = await getBarbeiros(id);
        const servicosData = await getServicos(id);
        const planosData = await getPlanosAssinatura(id);

        setBarbearia(barbeariaData);
        setBarbeiros(Array.isArray(barbeirosData) ? barbeirosData : []);
        setServicos(Array.isArray(servicosData) ? servicosData : []);
        setPlanos(Array.isArray(planosData) ? planosData : []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    carregar();
  }, [id]);

  const estaAberto = barbearia?.status === "ativo";

  const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];
  const mesesLabel = [
    "janeiro",
    "fevereiro",
    "marco",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const calendarioDias = useMemo(() => {
    const primeiroDiaDoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const ultimoDiaDoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const deslocamentoInicial = primeiroDiaDoMes.getDay();
    const totalDias = ultimoDiaDoMes.getDate();
    const totalCelulas = Math.ceil((deslocamentoInicial + totalDias) / 7) * 7;
    const lista = [];
    const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataSelecionadaNormalizada = new Date(
      dataSelecionada.getFullYear(),
      dataSelecionada.getMonth(),
      dataSelecionada.getDate(),
    );

    for (let index = 0; index < totalCelulas; index += 1) {
      const numeroDia = index - deslocamentoInicial + 1;
      const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), numeroDia);
      const dataNormalizada = new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate(),
      );

      lista.push({
        key: `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`,
        data,
        dia: data.getDate(),
        pertenceAoMes: data.getMonth() === mesAtual.getMonth(),
        ehPassado: dataNormalizada < hojeNormalizado,
        ehHoje: dataNormalizada.getTime() === hojeNormalizado.getTime(),
        ehSelecionado:
          dataNormalizada.getTime() === dataSelecionadaNormalizada.getTime(),
      });
    }

    return lista;
  }, [mesAtual, dataSelecionada]);

  const tituloMesAtual = `${mesesLabel[mesAtual.getMonth()]} de ${mesAtual.getFullYear()}`;

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
    const ehHoje =
      dataSelecionada.getDate() === hoje.getDate() &&
      dataSelecionada.getMonth() === hoje.getMonth() &&
      dataSelecionada.getFullYear() === hoje.getFullYear();
    if (!ehHoje) return true;
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
        ...new Set(
          servicos.flatMap((servico) =>
            Array.isArray(servico.categoria)
              ? servico.categoria
              : servico.categoria
                ? [servico.categoria]
                : [],
          ),
        ),
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
      lista = lista.filter((servico) => {
        const categorias = Array.isArray(servico.categoria)
          ? servico.categoria
          : servico.categoria
            ? [servico.categoria]
            : [];

        return categoriasSelecionadas.some((categoria) =>
          categorias.includes(categoria),
        );
      });
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

  const planosAtivos = useMemo(
    () => planos.filter((plano) => plano.status !== "inativo"),
    [planos],
  );

  const planoPublicoVisivel =
    Number(barbearia?.exibir_planos_publico ?? 1) !== 0 &&
    planosAtivos.length > 0;

  const irPara = (alvoId) => {
    const el = document.getElementById(alvoId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleChangeTab = (novaTab) => {
    setTab(novaTab);

    const anchors = {
      agendamento: "sec-agendamento",
      servicos: "sec-servicos",
      barbeiro: "sec-barbeiros",
    };

    requestAnimationFrame(() => {
      irPara(anchors[novaTab]);
    });
  };

  const handleAvancarAgendamento = () => {
    if (!horaSelecionada) {
      alert("Selecione um horario");
      return;
    }

    handleChangeTab("servicos");
  };

  const handleSelecionarServico = (servico) => {
    setServicoSelecionado(servico);
    setBarbeiroSelecionado(null);
    handleChangeTab("barbeiro");
  };

  const handleConfirmarAgendamento = async () => {
    if (!servicoSelecionado || !horaSelecionada || !barbeiroSelecionado) {
      alert("Complete o agendamento antes de confirmar.");
      return;
    }

    if (!clienteNome.trim() || !clienteTelefone.trim()) {
      alert("Informe nome e telefone para concluir o agendamento.");
      return;
    }

    try {
      setSalvandoAgendamento(true);

      await criarAgendamento({
        barbearia_id: Number(id),
        cliente_id: null,
        cliente_nome: clienteNome.trim(),
        cliente_telefone: clienteTelefone.trim(),
        barbeiro_id: barbeiroSelecionado.id,
        servico_id: servicoSelecionado.id,
        data: `${dataSelecionada.getFullYear()}-${String(
          dataSelecionada.getMonth() + 1,
        ).padStart(2, "0")}-${String(dataSelecionada.getDate()).padStart(2, "0")}`,
        hora: horaSelecionada,
        observacao: `Tipo de cliente: ${tipoCliente} | Pagamento: ${formaPagamento}${
          observacao ? ` | Obs: ${observacao}` : ""
        }`,
      });

      alert("Agendamento confirmado com sucesso.");
      setTab("agendamento");
      setHoraSelecionada("");
      setServicoSelecionado(null);
      setBarbeiroSelecionado(null);
      setObservacao("");
      setClienteNome("");
      setClienteTelefone("");
      setTipoCliente("Adulto");
      setFormaPagamento("Pix");
    } catch (error) {
      alert(error.message || "Nao foi possivel confirmar o agendamento.");
    } finally {
      setSalvandoAgendamento(false);
    }
  };

  const podeVoltarMes =
    mesAtual.getFullYear() > inicioMesAtual.getFullYear() ||
    (mesAtual.getFullYear() === inicioMesAtual.getFullYear() &&
      mesAtual.getMonth() > inicioMesAtual.getMonth());

  if (!barbearia) {
    return <div>Carregando barbearia...</div>;
  }

  const visualStyle = {
    "--gold": barbearia.cor_primaria || "#f5c542",
    "--gold2": barbearia.cor_secundaria || "#d7a52b",
    "--bg": barbearia.cor_fundo || "#050607",
  };

  return (
    <div className="barbearia-page" style={visualStyle}>
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
              <h1 className="bb-title">
                {barbearia?.texto_hero || barbearia?.nome}
              </h1>

              <p className="bb-subtitle">
                {barbearia?.subtitulo_hero ||
                  barbearia?.descricao ||
                  "Sua barbearia com identidade propria e agendamento online."}
              </p>

              <div className="bb-meta">
                <div className="bb-stars">★★★★★</div>

                <span className={`bb-badge ${estaAberto ? "open" : "closed"}`}>
                  {estaAberto ? "Aberto agora" : "Fechado"}
                </span>
              </div>
            </div>
          </div>

          <button
            className="bb-cta"
            onClick={() => handleChangeTab("agendamento")}
          >
            Agendar Horario
          </button>
        </div>
      </section>

      {planoPublicoVisivel ? (
        <section className="bb-planos-showcase">
          <div className="bb-planos-showcase-copy">
            <p className="bb-section-kicker">Assinaturas da Barbearia</p>
            <h2>{barbearia?.titulo_planos_publico || "Planos da barbearia"}</h2>
            <p>
              {barbearia?.subtitulo_planos_publico ||
                "Escolha um plano recorrente para manter o cuidado em dia."}
            </p>
          </div>

          <div className="bb-planos-showcase-grid">
            {planosAtivos.slice(0, 3).map((plano) => (
              <article key={plano.id} className="bb-plano-card bb-plano-card-compact">
                <div className="bb-plano-tag">{plano.recorrencia || "mensal"}</div>
                <h3>{plano.nome}</h3>
                <div className="bb-plano-preco">
                  <strong>R$ {Number(plano.preco || 0).toFixed(2)}</strong>
                  <span>/ mes</span>
                </div>
                <div className="bb-plano-benefits">
                  <div className="bb-plano-benefit">
                    <span className="bb-dot" />
                    <span>{plano.cortes_inclusos || 0} cortes inclusos</span>
                  </div>
                  <div className="bb-plano-benefit">
                    <span className="bb-dot" />
                    <span>{plano.barbas_inclusas || 0} barbas inclusas</span>
                  </div>
                </div>
                <button className="bb-plano-btn" type="button">
                  Quero esse plano
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="bb-tabs">
        <button
          className={`bb-tab ${tab === "agendamento" ? "active" : ""}`}
          onClick={() => handleChangeTab("agendamento")}
        >
          Agendamento
        </button>
        <button
          className={`bb-tab ${tab === "servicos" ? "active" : ""}`}
          onClick={() => handleChangeTab("servicos")}
        >
          Servicos
        </button>
        <button
          className={`bb-tab ${tab === "barbeiro" ? "active" : ""}`}
          onClick={() => handleChangeTab("barbeiro")}
        >
          Escolha seu Barbeiro
        </button>
      </div>

      <section
        id="sec-agendamento"
        className={`bb-section ${tab !== "agendamento" ? "bb-section-hidden" : ""}`}
      >
        <div className="bb-section-header">
          <p className="bb-section-kicker">Agendamento</p>
          <h2 className="bb-h2">Reserve seu horario com poucos cliques</h2>
          <p className="bb-section-subtitle">
            Escolha a data, selecione um horario e avance para montar seu atendimento.
          </p>
        </div>

        <div className="bb-grid2">
          <div className="bb-infoCard">
            <div className="bb-infoLine">
              <span className="bb-dot" /> {barbearia?.cidade || "Cidade"} -{" "}
              {barbearia?.estado || "--"}
            </div>
            <div className="bb-infoLine">
              <span className="bb-dot" /> {barbearia?.telefone || "Telefone nao informado"}
            </div>
            <div className="bb-infoLine">
              <span className="bb-dot" />{" "}
              {barbearia?.horario_funcionamento || "Horario nao informado"}
            </div>
          </div>

          <div className="bb-scheduleCard">
            <div className="bb-calendar-header">
              <button
                type="button"
                className="bb-calendar-nav"
                onClick={() =>
                  podeVoltarMes &&
                  setMesAtual(
                    new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1),
                  )
                }
                disabled={!podeVoltarMes}
              >
                {"<"}
              </button>
              <strong>{tituloMesAtual}</strong>
              <button
                type="button"
                className="bb-calendar-nav"
                onClick={() =>
                  setMesAtual(
                    new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1),
                  )
                }
              >
                {">"}
              </button>
            </div>
            <div className="bb-calendar-weekdays">
              {diasSemana.map((dia, index) => (
                <span key={`${dia}-${index}`}>{dia}</span>
              ))}
            </div>
            <div className="bb-calendar-grid">
              {calendarioDias.map((dia) => (
                <button
                  key={dia.key}
                  type="button"
                  className={[
                    "bb-day",
                    dia.ehSelecionado ? "active" : "",
                    dia.ehHoje ? "is-today" : "",
                    !dia.pertenceAoMes ? "is-outside" : "",
                    dia.ehPassado ? "disabled" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={dia.ehPassado || !dia.pertenceAoMes}
                  onClick={() => {
                    setDataSelecionada(dia.data);
                    setHoraSelecionada("");
                  }}
                >
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
                      if (disponivel) setHoraSelecionada(hora);
                    }}
                  >
                    {hora}
                  </button>
                );
              })}
            </div>

            <div className="bb-continueRow">
              <button className="bb-continue" onClick={handleAvancarAgendamento}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="sec-servicos"
        className={`bb-section ${tab !== "servicos" ? "bb-section-hidden" : ""}`}
      >
        <div className="bb-section-header">
          <p className="bb-section-kicker">Catalogo</p>
          <h2 className="bb-h2">Servicos em destaque</h2>
          <p className="bb-section-subtitle">
            Filtre por categoria, compare os precos e escolha o servico ideal.
          </p>
        </div>

        <div className="bb-filtros">
          <input
            type="text"
            placeholder="Buscar servico..."
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
          {servicosFiltrados.length > 0 ? (
            servicosFiltrados.map((servico) => (
              <ServiceCard
                key={servico.id}
                servico={{
                  ...servico,
                  duracao: servico.duracao || servico.duracao_minutos,
                  categoria: Array.isArray(servico.categoria)
                    ? servico.categoria
                    : servico.categoria
                      ? [servico.categoria]
                      : [],
                }}
                selected={servicoSelecionado?.id === servico.id}
                onSelect={() => handleSelecionarServico(servico)}
              />
            ))
          ) : (
            <div className="bb-empty-card">
              Nenhum servico encontrado com esse filtro.
            </div>
          )}
        </div>

      </section>

      <section
        id="sec-barbeiros"
        className={`bb-section ${tab !== "barbeiro" ? "bb-section-hidden" : ""}`}
      >
        <div className="bb-barbeiro-top">
          <p className="bb-section-kicker">Equipe</p>
          <h3 className="bb-h3">Escolha seu Barbeiro</h3>
          <p className="bb-section-subtitle">
            Compare especialidades, avaliacoes e defina quem vai atender voce.
          </p>

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
              <option value={0}>Todas avaliacoes</option>
              <option value={5}>★★★★★</option>
              <option value={4}>★★★★+</option>
              <option value={3}>★★★+</option>
            </select>
          </div>
        </div>

        <div className="bb-barbeiros-layout">
          <div className="bb-barbeiros-grid">
            {barbeirosFiltrados.length > 0 ? (
              barbeirosFiltrados.map((barbeiro) => (
                <BarberCard
                  key={barbeiro.id}
                  barbeiro={barbeiro}
                  selected={barbeiroSelecionado?.id === barbeiro.id}
                  onSelect={() => setBarbeiroSelecionado(barbeiro)}
                />
              ))
            ) : (
              <div className="bb-empty-card">
                Nenhum barbeiro encontrado com esse filtro.
              </div>
            )}
          </div>

          <div className="bb-resumo-lateral">
            <h3 className="bb-resumo-titulo">Resumo do Agendamento</h3>

            <div className="bb-resumo-item">
              <span>Servico</span>
              <strong>
                {servicoSelecionado ? servicoSelecionado.nome : "Nao selecionado"}
              </strong>
            </div>

            <div className="bb-resumo-item">
              <span>Data</span>
              <strong>
                {horaSelecionada
                  ? `${dataSelecionada.getDate()}/${dataSelecionada.getMonth() + 1}`
                  : "Nao selecionado"}
              </strong>
            </div>

            <div className="bb-resumo-item">
              <span>Horario</span>
              <strong>{horaSelecionada || "Nao selecionado"}</strong>
            </div>

            <div className="bb-resumo-item">
              <span>Barbeiro</span>
              <strong>
                {barbeiroSelecionado ? barbeiroSelecionado.nome : "Nao selecionado"}
              </strong>
            </div>

            <div className="bb-campo">
              <label>Nome do cliente</label>
              <input
                className="bb-select"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Digite seu nome"
              />
            </div>

            <div className="bb-campo">
              <label>Telefone</label>
              <input
                className="bb-select"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="bb-campo">
              <label>Tipo de cliente</label>
              <select
                className="bb-select"
                value={tipoCliente}
                onChange={(e) => setTipoCliente(e.target.value)}
              >
                <option>Adulto</option>
                <option>Crianca</option>
              </select>
            </div>

            <div className="bb-campo">
              <label>Forma de pagamento</label>
              <select
                className="bb-select"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
              >
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Cartao Debito</option>
                <option>Cartao Credito</option>
              </select>
            </div>

            <div className="bb-campo">
              <label>Observacao</label>
              <textarea
                className="bb-textarea"
                placeholder="Ex: Deixar mais baixo na lateral..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
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
              disabled={!servicoSelecionado || !horaSelecionada || !barbeiroSelecionado}
              onClick={handleConfirmarAgendamento}
            >
              {salvandoAgendamento ? "Confirmando..." : "Confirmar Agendamento"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

