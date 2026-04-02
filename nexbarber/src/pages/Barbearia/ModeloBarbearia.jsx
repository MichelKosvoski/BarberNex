import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  criarAgendamento,
  getBarbearia,
  getBarbeiros,
  getPlanosAssinatura,
  getServicos,
} from "../../services/api";
import {
  demoBarbearia,
  demoBarbeiros,
  demoPlanos,
  demoServicos,
} from "../../data/demoBarbearia";

import ServiceCard from "../../components/ServiceCard";
import BarberCard from "../../components/BarberCard";
import LanguageSelector from "../../components/LanguageSelector";
import { useLocale } from "../../context/LocaleContext";
import "../../styles/barbearia.css";

export default function ModeloBarbearia() {
  const { language, locale, formatCurrencyFromBrl, formatDate } = useLocale();
  const { id } = useParams();
  const isDemo = String(id).toLowerCase() === "demo";
  const hoje = useMemo(() => new Date(), []);
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
  const [tipoCliente, setTipoCliente] = useState("adult");
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [observacao, setObservacao] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [salvandoAgendamento, setSalvandoAgendamento] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [agendamentoSucesso, setAgendamentoSucesso] = useState(null);

  const [barbearia, setBarbearia] = useState(null);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const copy =
    language === "es"
      ? {
          loading: "Cargando barberia...",
          defaultSubtitle: "Tu barberia con identidad propia y reservas online.",
          open: "Abierto ahora",
          closed: "Cerrado",
          cta: "Reservar turno",
          plansKicker: "Suscripciones de la barberia",
          plansTitle: "Planes de la barberia",
          plansSubtitle: "Elige un plan recurrente para mantener el cuidado al dia.",
          tabs: { agendamento: "Reserva", servicos: "Servicios", barbeiro: "Elige tu barbero" },
          booking: { kicker: "Reserva", title: "Reserva tu horario en pocos clics", subtitle: "Elige la fecha, selecciona una hora y avanza para montar tu atencion.", continue: "Continuar" },
          infoFallback: { city: "Ciudad", phone: "Telefono no informado", hours: "Horario no informado" },
          services: { kicker: "Catalogo", title: "Servicios destacados", subtitle: "Filtra por categoria, compara precios y elige el servicio ideal.", search: "Buscar servicio...", empty: "Ningun servicio encontrado con este filtro." },
          barbers: { kicker: "Equipo", title: "Elige tu barbero", subtitle: "Compara especialidades, valoraciones y define quien te atendera.", search: "Buscar barbero...", allRatings: "Todas las valoraciones", empty: "Ningun barbero encontrado con este filtro." },
          summary: { title: "Resumen de la reserva", service: "Servicio", date: "Fecha", time: "Hora", barber: "Barbero", notSelected: "No seleccionado", customerName: "Nombre del cliente", customerPlaceholder: "Escribe tu nombre", phone: "Telefono", customerType: "Tipo de cliente", paymentMethod: "Forma de pago", note: "Observacion", notePlaceholder: "Ej: Dejar mas bajo en los laterales...", total: "Total", confirm: "Confirmar reserva", confirming: "Confirmando...", customerTypes: { adult: "Adulto", child: "Nino" }, paymentMethods: { pix: "Pix", cash: "Efectivo", debit: "Tarjeta debito", credit: "Tarjeta credito" } },
          messages: { selectTime: "Selecciona un horario para continuar.", complete: "Completa todas las etapas antes de confirmar.", customer: "Informa nombre y telefono para concluir la reserva.", failed: "No fue posible confirmar la reserva." },
          success: { kicker: "Reserva confirmada", title: "Tu horario fue reservado con exito.", customer: "Cliente", phone: "Telefono", service: "Servicio", barber: "Barbero", date: "Fecha", time: "Hora", close: "Cerrar" },
          recurrence: { mensal: "mensual", trimestral: "trimestral", semestral: "semestral", anual: "anual" },
          weekdays: ["D", "L", "M", "X", "J", "V", "S"],
        }
      : language === "en"
        ? {
            loading: "Loading barbershop...",
            defaultSubtitle: "Your barbershop with its own identity and online booking.",
            open: "Open now",
            closed: "Closed",
            cta: "Book now",
            plansKicker: "Barbershop memberships",
            plansTitle: "Barbershop plans",
            plansSubtitle: "Choose a recurring plan to keep your routine on track.",
            tabs: { agendamento: "Booking", servicos: "Services", barbeiro: "Choose your barber" },
            booking: { kicker: "Booking", title: "Book your slot in just a few clicks", subtitle: "Choose a date, select a time and move forward to build your appointment.", continue: "Continue" },
            infoFallback: { city: "City", phone: "Phone not provided", hours: "Hours not provided" },
            services: { kicker: "Catalog", title: "Featured services", subtitle: "Filter by category, compare prices and choose the ideal service.", search: "Search service...", empty: "No service found with this filter." },
            barbers: { kicker: "Team", title: "Choose your barber", subtitle: "Compare specialties, ratings and decide who will serve you.", search: "Search barber...", allRatings: "All ratings", empty: "No barber found with this filter." },
            summary: { title: "Booking summary", service: "Service", date: "Date", time: "Time", barber: "Barber", notSelected: "Not selected", customerName: "Customer name", customerPlaceholder: "Type your name", phone: "Phone", customerType: "Customer type", paymentMethod: "Payment method", note: "Note", notePlaceholder: "Example: keep the sides lower...", total: "Total", confirm: "Confirm booking", confirming: "Confirming...", customerTypes: { adult: "Adult", child: "Child" }, paymentMethods: { pix: "Pix", cash: "Cash", debit: "Debit card", credit: "Credit card" } },
            messages: { selectTime: "Select a time to continue.", complete: "Complete every step before confirming.", customer: "Enter name and phone to finish the booking.", failed: "Could not confirm the booking." },
            success: { kicker: "Booking confirmed", title: "Your time slot has been reserved successfully.", customer: "Customer", phone: "Phone", service: "Service", barber: "Barber", date: "Date", time: "Time", close: "Close" },
            recurrence: { mensal: "monthly", trimestral: "quarterly", semestral: "semiannual", anual: "annual" },
            weekdays: ["S", "M", "T", "W", "T", "F", "S"],
          }
        : {
            loading: "Carregando barbearia...",
            defaultSubtitle: "Sua barbearia com identidade propria e agendamento online.",
            open: "Aberto agora",
            closed: "Fechado",
            cta: "Agendar horario",
            plansKicker: "Assinaturas da barbearia",
            plansTitle: "Planos da barbearia",
            plansSubtitle: "Escolha um plano recorrente para manter o cuidado em dia.",
            tabs: { agendamento: "Agendamento", servicos: "Servicos", barbeiro: "Escolha seu barbeiro" },
            booking: { kicker: "Agendamento", title: "Reserve seu horario com poucos cliques", subtitle: "Escolha a data, selecione um horario e avance para montar seu atendimento.", continue: "Continuar" },
            infoFallback: { city: "Cidade", phone: "Telefone nao informado", hours: "Horario nao informado" },
            services: { kicker: "Catalogo", title: "Servicos em destaque", subtitle: "Filtre por categoria, compare os precos e escolha o servico ideal.", search: "Buscar servico...", empty: "Nenhum servico encontrado com esse filtro." },
            barbers: { kicker: "Equipe", title: "Escolha seu barbeiro", subtitle: "Compare especialidades, avaliacoes e defina quem vai atender voce.", search: "Buscar barbeiro...", allRatings: "Todas avaliacoes", empty: "Nenhum barbeiro encontrado com esse filtro." },
            summary: { title: "Resumo do agendamento", service: "Servico", date: "Data", time: "Horario", barber: "Barbeiro", notSelected: "Nao selecionado", customerName: "Nome do cliente", customerPlaceholder: "Digite seu nome", phone: "Telefone", customerType: "Tipo de cliente", paymentMethod: "Forma de pagamento", note: "Observacao", notePlaceholder: "Ex: Deixar mais baixo na lateral...", total: "Total", confirm: "Confirmar agendamento", confirming: "Confirmando...", customerTypes: { adult: "Adulto", child: "Crianca" }, paymentMethods: { pix: "Pix", cash: "Dinheiro", debit: "Cartao debito", credit: "Cartao credito" } },
            messages: { selectTime: "Selecione um horario para continuar.", complete: "Complete todas as etapas antes de confirmar.", customer: "Informe nome e telefone para concluir o agendamento.", failed: "Nao foi possivel confirmar o agendamento." },
            success: { kicker: "Agendamento confirmado", title: "Seu horario foi reservado com sucesso.", customer: "Cliente", phone: "Telefone", service: "Servico", barber: "Barbeiro", date: "Data", time: "Horario", close: "Fechar" },
            recurrence: { mensal: "mensal", trimestral: "trimestral", semestral: "semestral", anual: "anual" },
            weekdays: ["D", "S", "T", "Q", "Q", "S", "S"],
          };

  useEffect(() => {
    async function carregar() {
      if (isDemo) {
        setBarbearia(demoBarbearia);
        setBarbeiros(demoBarbeiros);
        setServicos(demoServicos);
        setPlanos(demoPlanos);
        return;
      }

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
  }, [id, isDemo]);

  const estaAberto = barbearia?.status === "ativo";

  const diasSemana = copy.weekdays;

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
  }, [dataSelecionada, hoje, mesAtual]);

  const tituloMesAtual = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(mesAtual);

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
      setMensagemErro(copy.messages.selectTime);
      return;
    }

    setMensagemErro("");
    handleChangeTab("servicos");
  };

  const handleSelecionarServico = (servico) => {
    setServicoSelecionado(servico);
    setBarbeiroSelecionado(null);
    handleChangeTab("barbeiro");
  };

  const handleConfirmarAgendamento = async () => {
    if (!servicoSelecionado || !horaSelecionada || !barbeiroSelecionado) {
      setMensagemErro(copy.messages.complete);
      return;
    }

    if (!clienteNome.trim() || !clienteTelefone.trim()) {
      setMensagemErro(copy.messages.customer);
      return;
    }

    try {
      setSalvandoAgendamento(true);
      setMensagemErro("");

      if (!isDemo) {
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
          observacao: `Tipo de cliente: ${copy.summary.customerTypes[tipoCliente] || tipoCliente} | Pagamento: ${copy.summary.paymentMethods[formaPagamento] || formaPagamento}${
            observacao ? ` | Obs: ${observacao}` : ""
          }`,
        });
      }

      setAgendamentoSucesso({
        cliente: clienteNome.trim(),
        telefone: clienteTelefone.trim(),
        data: `${String(dataSelecionada.getDate()).padStart(2, "0")}/${String(
          dataSelecionada.getMonth() + 1,
        ).padStart(2, "0")}/${dataSelecionada.getFullYear()}`,
        hora: horaSelecionada,
        servico: servicoSelecionado.nome,
        barbeiro: barbeiroSelecionado.nome,
      });
      setTab("agendamento");
      setHoraSelecionada("");
      setServicoSelecionado(null);
      setBarbeiroSelecionado(null);
      setObservacao("");
      setClienteNome("");
      setClienteTelefone("");
      setTipoCliente("adult");
      setFormaPagamento("pix");
    } catch (error) {
      setMensagemErro(error.message || copy.messages.failed);
    } finally {
      setSalvandoAgendamento(false);
    }
  };

  const podeVoltarMes =
    mesAtual.getFullYear() > inicioMesAtual.getFullYear() ||
    (mesAtual.getFullYear() === inicioMesAtual.getFullYear() &&
      mesAtual.getMonth() > inicioMesAtual.getMonth());

  if (!barbearia) {
    return <div>{copy.loading}</div>;
  }

  const visualStyle = {
    "--gold": barbearia.cor_primaria || "#f5c542",
    "--gold2": barbearia.cor_secundaria || "#d7a52b",
    "--bg": barbearia.cor_fundo || "#050607",
    "--card": barbearia.cor_card || "#11141b",
    "--border": barbearia.cor_borda || "#2a2f39",
    "--text": barbearia.cor_texto || "#f3f4f6",
    "--muted": barbearia.cor_texto_secundario || "rgba(255, 255, 255, 0.7)",
    "--button-text": barbearia.cor_botao_texto || "#151515",
    "--font-heading": barbearia.fonte_titulo || "Georgia, 'Times New Roman', serif",
    "--font-body":
      barbearia.fonte_corpo || "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    "--title-size": `${Number(barbearia.tamanho_titulo || 42)}px`,
    "--body-size": `${Number(barbearia.tamanho_texto || 18)}px`,
    "--logo-size": `${Number(barbearia.tamanho_logo || 86)}px`,
    "--hero-overlay": toRgba(
      barbearia.overlay_cor || "#000000",
      Number(barbearia.overlay_opacidade ?? 72) / 100,
    ),
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
                  copy.defaultSubtitle}
              </p>

              <div className="bb-meta">
                <div className="bb-stars">★★★★★</div>

                <span className={`bb-badge ${estaAberto ? "open" : "closed"}`}>
                  {estaAberto ? copy.open : copy.closed}
                </span>
              </div>
            </div>
          </div>

          <div className="bb-hero-actions">
            <LanguageSelector className="bb-language-select" compact />
            <button
              className="bb-cta"
              onClick={() => handleChangeTab("agendamento")}
            >
              {copy.cta}
            </button>
          </div>
        </div>
      </section>

      {planoPublicoVisivel ? (
        <section className="bb-planos-showcase">
          <div className="bb-planos-showcase-copy">
            <p className="bb-section-kicker">{copy.plansKicker}</p>
            <h2>{barbearia?.titulo_planos_publico || copy.plansTitle}</h2>
            <p>
              {barbearia?.subtitulo_planos_publico ||
                copy.plansSubtitle}
            </p>
          </div>

          <div className="bb-planos-showcase-grid">
            {planosAtivos.slice(0, 3).map((plano) => (
              <article key={plano.id} className="bb-plano-card bb-plano-card-compact">
                <div className="bb-plano-tag">{copy.recurrence[String(plano.recorrencia || "mensal").toLowerCase()] || String(plano.recorrencia || "mensal")}</div>
                <h3>{plano.nome}</h3>
                <div className="bb-plano-preco">
                  <strong>{formatCurrencyFromBrl(plano.preco || 0)}</strong>
                  <span>/ {copy.recurrence[String(plano.recorrencia || "mensal").toLowerCase()] || String(plano.recorrencia || "mensal")}</span>
                </div>
                <div className="bb-plano-benefits">
                  <div className="bb-plano-benefit">
                    <span className="bb-dot" />
                    <span>{plano.cortes_inclusos || 0} {language === "en" ? "included haircuts" : language === "es" ? "cortes incluidos" : "cortes inclusos"}</span>
                  </div>
                  <div className="bb-plano-benefit">
                    <span className="bb-dot" />
                    <span>{plano.barbas_inclusas || 0} {language === "en" ? "included beard trims" : language === "es" ? "barbas incluidas" : "barbas inclusas"}</span>
                  </div>
                </div>
                <button className="bb-plano-btn" type="button">
                  {language === "en" ? "Choose this plan" : language === "es" ? "Quiero este plan" : "Quero esse plano"}
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
          {copy.tabs.agendamento}
        </button>
        <button
          className={`bb-tab ${tab === "servicos" ? "active" : ""}`}
          onClick={() => handleChangeTab("servicos")}
        >
          {copy.tabs.servicos}
        </button>
        <button
          className={`bb-tab ${tab === "barbeiro" ? "active" : ""}`}
          onClick={() => handleChangeTab("barbeiro")}
        >
          {copy.tabs.barbeiro}
        </button>
      </div>

      <section
        id="sec-agendamento"
        className={`bb-section ${tab !== "agendamento" ? "bb-section-hidden" : ""}`}
      >
        <div className="bb-section-header">
          <p className="bb-section-kicker">{copy.booking.kicker}</p>
          <h2 className="bb-h2">{copy.booking.title}</h2>
          <p className="bb-section-subtitle">{copy.booking.subtitle}</p>
        </div>

        <div className="bb-grid2">
          <div className="bb-infoCard">
            <div className="bb-infoLine">
              <span className="bb-dot" /> {barbearia?.cidade || copy.infoFallback.city} -{" "}
              {barbearia?.estado || "--"}
            </div>
            <div className="bb-infoLine">
              <span className="bb-dot" /> {barbearia?.telefone || copy.infoFallback.phone}
            </div>
            <div className="bb-infoLine">
              <span className="bb-dot" />{" "}
              {barbearia?.horario_funcionamento || copy.infoFallback.hours}
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
                {copy.booking.continue}
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
          <p className="bb-section-kicker">{copy.services.kicker}</p>
          <h2 className="bb-h2">{copy.services.title}</h2>
          <p className="bb-section-subtitle">{copy.services.subtitle}</p>
        </div>

        <div className="bb-filtros">
          <input
            type="text"
            placeholder={copy.services.search}
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
              {copy.services.empty}
            </div>
          )}
        </div>

      </section>

      <section
        id="sec-barbeiros"
        className={`bb-section ${tab !== "barbeiro" ? "bb-section-hidden" : ""}`}
      >
        <div className="bb-barbeiro-top">
          <p className="bb-section-kicker">{copy.barbers.kicker}</p>
          <h3 className="bb-h3">{copy.barbers.title}</h3>
          <p className="bb-section-subtitle">{copy.barbers.subtitle}</p>

          <div className="bb-barbeiro-filtros">
            <input
              type="text"
              placeholder={copy.barbers.search}
              value={buscaBarbeiro}
              onChange={(e) => setBuscaBarbeiro(e.target.value)}
              className="bb-input-busca"
            />

            <select
              value={filtroEstrelas}
              onChange={(e) => setFiltroEstrelas(Number(e.target.value))}
              className="bb-select-estrelas"
            >
              <option value={0}>{copy.barbers.allRatings}</option>
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
              {copy.barbers.empty}
              </div>
            )}
          </div>

          <div className="bb-resumo-lateral">
            <h3 className="bb-resumo-titulo">{copy.summary.title}</h3>

            <div className="bb-resumo-item">
              <span>{copy.summary.service}</span>
              <strong>
                {servicoSelecionado ? servicoSelecionado.nome : copy.summary.notSelected}
              </strong>
            </div>

            <div className="bb-resumo-item">
              <span>{copy.summary.date}</span>
              <strong>
                {horaSelecionada
                  ? formatDate(dataSelecionada, { day: "2-digit", month: "2-digit" })
                  : copy.summary.notSelected}
              </strong>
            </div>

            <div className="bb-resumo-item">
              <span>{copy.summary.time}</span>
              <strong>{horaSelecionada || copy.summary.notSelected}</strong>
            </div>

            <div className="bb-resumo-item">
              <span>{copy.summary.barber}</span>
              <strong>
                {barbeiroSelecionado ? barbeiroSelecionado.nome : copy.summary.notSelected}
              </strong>
            </div>

            <div className="bb-campo">
              <label>{copy.summary.customerName}</label>
              <input
                className="bb-select"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder={copy.summary.customerPlaceholder}
              />
            </div>

            <div className="bb-campo">
              <label>{copy.summary.phone}</label>
              <input
                className="bb-select"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="bb-campo">
              <label>{copy.summary.customerType}</label>
              <select
                className="bb-select"
                value={tipoCliente}
                onChange={(e) => setTipoCliente(e.target.value)}
              >
                <option value="adult">{copy.summary.customerTypes.adult}</option>
                <option value="child">{copy.summary.customerTypes.child}</option>
              </select>
            </div>

            <div className="bb-campo">
              <label>{copy.summary.paymentMethod}</label>
              <select
                className="bb-select"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
              >
                <option value="pix">{copy.summary.paymentMethods.pix}</option>
                <option value="cash">{copy.summary.paymentMethods.cash}</option>
                <option value="debit">{copy.summary.paymentMethods.debit}</option>
                <option value="credit">{copy.summary.paymentMethods.credit}</option>
              </select>
            </div>

            <div className="bb-campo">
              <label>{copy.summary.note}</label>
              <textarea
                className="bb-textarea"
                placeholder={copy.summary.notePlaceholder}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            <div className="bb-total">
              <span>{copy.summary.total}</span>
              <strong>{formatCurrencyFromBrl(servicoSelecionado?.preco || 0)}</strong>
            </div>

            <button
              className="bb-btn-confirmar"
              disabled={!servicoSelecionado || !horaSelecionada || !barbeiroSelecionado}
              onClick={handleConfirmarAgendamento}
            >
              {salvandoAgendamento ? copy.summary.confirming : copy.summary.confirm}
            </button>
          </div>
        </div>
      </section>

      {mensagemErro ? <div className="bb-floating-feedback erro">{mensagemErro}</div> : null}

      {agendamentoSucesso ? (
        <div className="bb-modal-overlay" onClick={() => setAgendamentoSucesso(null)}>
          <div className="bb-modal" onClick={(e) => e.stopPropagation()}>
            <p className="bb-section-kicker">{copy.success.kicker}</p>
            <h3 className="bb-h3">{copy.success.title}</h3>

            <div className="bb-modal-summary">
              <div className="bb-modal-row"><span>{copy.success.customer}</span><strong>{agendamentoSucesso.cliente}</strong></div>
              <div className="bb-modal-row"><span>{copy.success.phone}</span><strong>{agendamentoSucesso.telefone}</strong></div>
              <div className="bb-modal-row"><span>{copy.success.service}</span><strong>{agendamentoSucesso.servico}</strong></div>
              <div className="bb-modal-row"><span>{copy.success.barber}</span><strong>{agendamentoSucesso.barbeiro}</strong></div>
              <div className="bb-modal-row"><span>{copy.success.date}</span><strong>{agendamentoSucesso.data}</strong></div>
              <div className="bb-modal-row"><span>{copy.success.time}</span><strong>{agendamentoSucesso.hora}</strong></div>
            </div>

            <div className="bb-modal-actions">
              <button type="button" className="bb-btn-confirmar" onClick={() => setAgendamentoSucesso(null)}>
                {copy.success.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function toRgba(color, alpha) {
  if (!color) return `rgba(0, 0, 0, ${alpha})`;
  if (String(color).startsWith("rgba")) return color;
  if (String(color).startsWith("rgb")) {
    const match = String(color).match(/\d+/g);
    if (!match || match.length < 3) return `rgba(0, 0, 0, ${alpha})`;
    const [r, g, b] = match.map(Number);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const hex = String(color).replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const int = Number.parseInt(normalized, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

