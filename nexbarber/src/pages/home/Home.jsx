import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeadphones, FiInstagram } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io";
import { getMasterPlanosPublicos } from "../../services/api";
import { useLocale } from "../../context/LocaleContext";
import LanguageSelector from "../../components/LanguageSelector";
import Logo from "../../assets/Logo.png";
import Fundo from "../../assets/Fundo.png";
import ArteNex from "../../assets/ArteNex.png";
import Banercard1 from "../../assets/Banercard1.png";
import Barbermodel from "../../assets/Barbermodel.png";
import "../../styles/home.css";

const BILLING_ORDER = ["mensal", "trimestral", "semestral", "anual"];

const HOME_COPY = {
  "pt-BR": {
    nav: { resources: "Recursos", how: "Como funciona", plans: "Planos", admin: "Painel admin" },
    header: { demo: "Ver demonstracao", login: "Entrar / Registrar" },
    hero: {
      kicker: "Plataforma para barbearias",
      title:
        "Mostre sua barbearia profissionalmente, receba agendamentos e controle tudo em um sistema que o cliente entende na hora.",
      description:
        "O NexCut reune agenda online, painel administrativo, clientes, produtos, PDV, relatorios e pagina propria da barbearia em uma estrutura feita para vender assinaturas e organizar a operacao.",
      primary: "Cadastrar barbearia",
      secondary: "Ver demonstracao",
      stats: [
        { title: "Agenda online", text: "O cliente agenda em poucos cliques" },
        { title: "Painel admin", text: "Controle diario da operacao" },
        { title: "Personalizacao", text: "Site da barbearia com identidade propria" },
      ],
      videoBadge: "Demonstracao real",
      videoText:
        "Adicione um video mostrando agenda, painel admin, PDV e a pagina da barbearia em funcionamento.",
    },
    proof: {
      kicker: "Prova visual do produto",
      title: "Veja o sistema funcionando antes de contratar.",
      description:
        "Em vez de prometer no texto, o NexCut mostra na pratica como a barbearia vai vender, organizar a agenda e controlar o negocio.",
      cards: [
        {
          code: "panel",
          title: "Painel da barbearia",
          description: "Agenda, clientes, barbeiros, servicos, produtos, PDV e relatorios em uma tela profissional.",
          tag: "Painel admin",
          action: "Ver painel",
        },
        {
          code: "public",
          title: "Pagina publica pronta para vender",
          description: "Cada barbearia ganha sua propria pagina com banner, planos, agendamento e identidade visual.",
          tag: "Pagina publica",
          action: "Ver demonstracao",
        },
        {
          code: "daily",
          title: "Operacao organizada no dia a dia",
          description: "Tenha uma visao mais profissional da rotina da barbearia com agenda, operacao e apresentacao comercial alinhadas.",
          tag: "Gestao diaria",
          action: "Conhecer planos",
        },
      ],
      stripTitle: "O cliente nao compra so texto. Ele compra clareza.",
      stripDescription:
        "Mostre agenda, painel, pagina publica e operacao real. Isso reduz duvidas e aumenta a conversao da assinatura.",
      points: [
        "Agenda online real",
        "Painel com operacao diaria",
        "Pagina publica com identidade visual",
        "Fluxo comercial mais organizado",
      ],
    },
    resources: {
      kicker: "Recursos do sistema",
      title: "Um sistema so para vender, operar e administrar a barbearia.",
      items: [
        {
          title: "Agenda online",
          description: "Receba agendamentos 24 horas por dia com um fluxo simples para o cliente e controle imediato para a barbearia.",
        },
        {
          title: "Painel administrativo",
          description: "Gerencie barbeiros, servicos, clientes, produtos, caixa, relatorios e personalizacao do site em um so lugar.",
        },
        {
          title: "Pagina publica da barbearia",
          description: "Cada barbearia ganha sua propria vitrine com identidade visual, banner, logo, planos e link exclusivo.",
        },
        {
          title: "Controle comercial",
          description: "Acompanhe entradas, saidas e o desempenho da operacao para crescer com mais clareza e seguranca.",
        },
      ],
    },
    steps: {
      kicker: "Como funciona",
      title: "Fluxo simples para voce operar e escalar o NexCut.",
      items: [
        "A barbearia contrata um plano e recebe acesso ao sistema.",
        "O dono configura equipe, servicos, produtos, horarios e o visual da pagina.",
        "O cliente agenda online e a barbearia acompanha tudo pelo painel.",
        "A operacao fica centralizada para vender mais, atender melhor e manter o negocio organizado.",
      ],
    },
    admin: {
      kicker: "Painel administrativo",
      title: "O dono controla a operacao. O funcionario executa sem bagunca.",
      description:
        "No painel da barbearia voce acompanha agenda, clientes, barbeiros, servicos, produtos, PDV, relatorios e personalizacao do site em uma estrutura feita para o dia a dia da equipe.",
      items: [
        "Agenda com remarcacao, cancelamento e confirmacao.",
        "Cadastro de servicos, barbeiros, produtos e clientes.",
        "PDV para venda de itens de espera e atendimento.",
        "Relatorios de entradas, saidas, lucro bruto e liquido.",
        "Personalizacao visual da pagina publica da barbearia.",
      ],
      boardTitles: { shop: "Barbearia", website: "Site da barbearia" },
      boardShop: ["Agenda", "Clientes", "Servicos", "Produtos", "PDV", "Relatorios"],
      boardWebsite: ["Banner", "Logo", "Planos", "Agendamento", "Identidade visual", "Link exclusivo"],
    },
    pricing: {
      kicker: "Planos do NexCut",
      title: "Escolha o nivel de operacao ideal para cada barbearia.",
      description:
        "Selecione o ciclo de pagamento ideal para sua operacao. Quanto maior o periodo, maior a economia no valor final.",
      choose: "Quero esse plano",
      perMonth: "por mes",
      noCommitment: "Sem fidelidade",
      cycles: {
        mensal: { label: "Mensal", shortLabel: "mensal", savings: null },
        trimestral: { label: "Trimestral", shortLabel: "trimestral", savings: "5% OFF" },
        semestral: { label: "Semestral", shortLabel: "semestral", savings: "10% OFF" },
        anual: { label: "Anual", shortLabel: "anual", savings: "15% OFF" },
      },
      planCopy: {
        agenda: {
          name: "Prata",
          badge: "Agenda essencial",
          subtitle: "Ideal para quem quer vender agenda online sem complexidade.",
          items: ["Agenda online", "Controle de agendamentos", "Resumo financeiro", "Pagina publica da barbearia", "Suporte para operacao inicial"],
        },
        completo: {
          name: "Gold",
          badge: "Painel completo",
          subtitle: "Pacote completo para operar a barbearia com administracao total.",
          items: ["Tudo do plano Prata", "Clientes, barbeiros e servicos", "Produtos, PDV e caixa", "Relatorios e personalizacao", "Painel administrativo completo"],
        },
      },
    },
    cta: {
      kicker: "Pronto para vender",
      title: "Comece com um plano e evolua a operacao da barbearia.",
      description: "O NexCut ajuda voce a vender assinaturas, organizar a agenda e controlar a barbearia com mais profissionalismo.",
      primary: "Comecar agora",
      secondary: "Ja tenho acesso",
    },
    contact: {
      kicker: "Fale conosco",
      title: "Precisa de ajuda para escolher o plano ou tirar duvidas?",
      description: "Nossa equipe pode te orientar sobre implantacao, suporte, planos e a melhor estrutura para a sua barbearia comecar com seguranca.",
      instagram: "Falar pelo Instagram",
      support: "Falar com suporte",
    },
    footer: { builtBy: "desenvolvida pela", rights: "Todos os direitos reservados" },
  },
  es: {
    nav: { resources: "Recursos", how: "Como funciona", plans: "Planes", admin: "Panel admin" },
    header: { demo: "Ver demostracion", login: "Entrar / Registrarse" },
    hero: {
      kicker: "Plataforma para barberias",
      title: "Muestra tu barberia con mas profesionalismo, recibe reservas y controla todo en un sistema que el cliente entiende al instante.",
      description: "NexCut reune agenda online, panel administrativo, clientes, productos, punto de venta, informes y una pagina propia de la barberia en una estructura hecha para vender suscripciones y organizar la operacion.",
      primary: "Registrar barberia",
      secondary: "Ver demostracion",
      stats: [
        { title: "Agenda online", text: "El cliente reserva en pocos clics" },
        { title: "Panel admin", text: "Control diario de la operacion" },
        { title: "Personalizacion", text: "Sitio de la barberia con identidad propia" },
      ],
      videoBadge: "Demostracion real",
      videoText: "Agrega un video mostrando agenda, panel admin, punto de venta y la pagina de la barberia funcionando.",
    },
    proof: {
      kicker: "Prueba visual del producto",
      title: "Mira el sistema funcionando antes de contratar.",
      description: "En lugar de prometer con texto, NexCut muestra en la practica como la barberia va a vender, organizar la agenda y controlar el negocio.",
      cards: [
        { code: "panel", title: "Panel de la barberia", description: "Agenda, clientes, barberos, servicios, productos, punto de venta e informes en una pantalla profesional.", tag: "Panel admin", action: "Ver panel" },
        { code: "public", title: "Pagina publica lista para vender", description: "Cada barberia obtiene su propia pagina con banner, planes, reservas e identidad visual.", tag: "Pagina publica", action: "Ver demostracion" },
        { code: "daily", title: "Operacion organizada en el dia a dia", description: "Ten una vision mas profesional de la rutina de la barberia con agenda, operacion y presentacion comercial alineadas.", tag: "Gestion diaria", action: "Conocer planes" },
      ],
      stripTitle: "El cliente no compra solo texto. Compra claridad.",
      stripDescription: "Muestra agenda, panel, pagina publica y operacion real. Esto reduce dudas y mejora la conversion de la suscripcion.",
      points: ["Agenda online real", "Panel con operacion diaria", "Pagina publica con identidad visual", "Flujo comercial mas organizado"],
    },
    resources: {
      kicker: "Recursos del sistema",
      title: "Un solo sistema para vender, operar y administrar la barberia.",
      items: [
        { title: "Agenda online", description: "Recibe reservas las 24 horas con un flujo simple para el cliente y control inmediato para la barberia." },
        { title: "Panel administrativo", description: "Gestiona barberos, servicios, clientes, productos, caja, informes y personalizacion del sitio en un solo lugar." },
        { title: "Pagina publica de la barberia", description: "Cada barberia obtiene su propio escaparate con identidad visual, banner, logo, planes y enlace exclusivo." },
        { title: "Control comercial", description: "Sigue ingresos, salidas y el rendimiento de la operacion para crecer con mas claridad y seguridad." },
      ],
    },
    steps: {
      kicker: "Como funciona",
      title: "Flujo simple para operar y escalar NexCut.",
      items: [
        "La barberia contrata un plan y recibe acceso al sistema.",
        "El propietario configura equipo, servicios, productos, horarios y el visual de la pagina.",
        "El cliente reserva online y la barberia sigue todo desde el panel.",
        "La operacion queda centralizada para vender mas, atender mejor y mantener el negocio organizado.",
      ],
    },
    admin: {
      kicker: "Panel administrativo",
      title: "El propietario controla la operacion. El equipo ejecuta sin desorden.",
      description: "En el panel de la barberia acompanhas agenda, clientes, barberos, servicios, productos, punto de venta, informes y personalizacion del sitio en una estructura hecha para el dia a dia del equipo.",
      items: [
        "Agenda con cambio de fecha, cancelacion y confirmacion.",
        "Registro de servicios, barberos, productos y clientes.",
        "Punto de venta para articulos de espera y atencion.",
        "Informes de entradas, salidas, utilidad bruta y neta.",
        "Personalizacion visual de la pagina publica de la barberia.",
      ],
      boardTitles: { shop: "Barberia", website: "Sitio de la barberia" },
      boardShop: ["Agenda", "Clientes", "Servicios", "Productos", "Punto de venta", "Informes"],
      boardWebsite: ["Banner", "Logo", "Planes", "Reservas", "Identidad visual", "Enlace exclusivo"],
    },
    pricing: {
      kicker: "Planes de NexCut",
      title: "Elige el nivel de operacion ideal para cada barberia.",
      description: "Selecciona el ciclo de pago ideal para tu operacion. Cuanto mayor sea el periodo, mayor sera el ahorro final.",
      choose: "Quiero este plan",
      perMonth: "por mes",
      noCommitment: "Sin permanencia",
      cycles: {
        mensal: { label: "Mensual", shortLabel: "mensual", savings: null },
        trimestral: { label: "Trimestral", shortLabel: "trimestral", savings: "5% OFF" },
        semestral: { label: "Semestral", shortLabel: "semestral", savings: "10% OFF" },
        anual: { label: "Anual", shortLabel: "anual", savings: "15% OFF" },
      },
      planCopy: {
        agenda: { name: "Silver", badge: "Agenda esencial", subtitle: "Ideal para vender reservas online sin complicaciones.", items: ["Agenda online", "Control de reservas", "Resumen financiero", "Pagina publica de la barberia", "Soporte para la operacion inicial"] },
        completo: { name: "Gold", badge: "Panel completo", subtitle: "Paquete completo para operar la barberia con gestion total.", items: ["Todo lo del plan Silver", "Clientes, barberos y servicios", "Productos, punto de venta y caja", "Informes y personalizacion", "Panel administrativo completo"] },
      },
    },
    cta: {
      kicker: "Listo para vender",
      title: "Empieza con un plan y mejora la operacion de la barberia.",
      description: "NexCut te ayuda a vender suscripciones, organizar la agenda y controlar la barberia con mas profesionalismo.",
      primary: "Empezar ahora",
      secondary: "Ya tengo acceso",
    },
    contact: {
      kicker: "Habla con nosotros",
      title: "Necesitas ayuda para elegir el plan o resolver dudas?",
      description: "Nuestro equipo puede orientarte sobre implantacion, soporte, planes y la mejor estructura para que tu barberia empiece con seguridad.",
      instagram: "Hablar por Instagram",
      support: "Hablar con soporte",
    },
    footer: { builtBy: "desarrollada por", rights: "Todos los derechos reservados" },
  },
  en: {
    nav: { resources: "Features", how: "How it works", plans: "Plans", admin: "Admin panel" },
    header: { demo: "View demo", login: "Sign in / Register" },
    hero: {
      kicker: "Platform for barbershops",
      title: "Show your barbershop professionally, get bookings and control everything in a system the client understands right away.",
      description: "NexCut brings together online booking, admin panel, clients, products, POS, reports and a dedicated barbershop page in a structure built to sell subscriptions and organize operations.",
      primary: "Register barbershop",
      secondary: "View demo",
      stats: [
        { title: "Online booking", text: "Clients book in just a few clicks" },
        { title: "Admin panel", text: "Daily operation control" },
        { title: "Customization", text: "Barbershop site with its own identity" },
      ],
      videoBadge: "Real demo",
      videoText: "Add a video showing booking, admin panel, POS and the barbershop page running in real life.",
    },
    proof: {
      kicker: "Visual proof of the product",
      title: "See the system working before signing up.",
      description: "Instead of only promising with text, NexCut shows in practice how the barbershop can sell, organize bookings and control the business.",
      cards: [
        { code: "panel", title: "Barbershop panel", description: "Bookings, clients, barbers, services, products, POS and reports in one professional screen.", tag: "Admin panel", action: "View panel" },
        { code: "public", title: "Public page ready to sell", description: "Each barbershop gets its own page with banner, plans, booking and visual identity.", tag: "Public page", action: "View demo" },
        { code: "daily", title: "Daily operation organized", description: "Get a more professional view of the barbershop routine with booking, operation and sales presentation aligned.", tag: "Daily management", action: "See plans" },
      ],
      stripTitle: "Clients do not buy only text. They buy clarity.",
      stripDescription: "Show booking, panel, public page and real operation. That reduces doubts and improves subscription conversion.",
      points: ["Real online booking", "Panel with daily operation", "Public page with visual identity", "More organized sales flow"],
    },
    resources: {
      kicker: "System features",
      title: "One system to sell, operate and manage the barbershop.",
      items: [
        { title: "Online booking", description: "Receive bookings 24 hours a day with a simple customer flow and immediate control for the barbershop." },
        { title: "Admin panel", description: "Manage barbers, services, clients, products, cash flow, reports and site customization in one place." },
        { title: "Public barbershop page", description: "Each barbershop gets its own storefront with visual identity, banner, logo, plans and exclusive link." },
        { title: "Commercial control", description: "Track income, expenses and operation performance to grow with more clarity and confidence." },
      ],
    },
    steps: {
      kicker: "How it works",
      title: "A simple flow to run and scale NexCut.",
      items: [
        "The barbershop signs up for a plan and gets access to the system.",
        "The owner sets up the team, services, products, schedules and the page visual identity.",
        "The client books online and the barbershop follows everything from the panel.",
        "The operation becomes centralized to sell more, serve better and keep the business organized.",
      ],
    },
    admin: {
      kicker: "Admin panel",
      title: "The owner controls the operation. The team executes without chaos.",
      description: "In the barbershop panel you follow bookings, clients, barbers, services, products, POS, reports and site customization in a structure built for the team daily routine.",
      items: [
        "Booking changes, cancellation and confirmation.",
        "Registration of services, barbers, products and clients.",
        "POS for waiting-area products and appointments.",
        "Reports for income, expenses, gross profit and net profit.",
        "Visual customization of the public barbershop page.",
      ],
      boardTitles: { shop: "Barbershop", website: "Barbershop site" },
      boardShop: ["Booking", "Clients", "Services", "Products", "POS", "Reports"],
      boardWebsite: ["Banner", "Logo", "Plans", "Booking", "Visual identity", "Exclusive link"],
    },
    pricing: {
      kicker: "NexCut plans",
      title: "Choose the ideal operating level for each barbershop.",
      description: "Select the payment cycle that best fits your operation. The longer the period, the greater the savings on the final price.",
      choose: "Choose this plan",
      perMonth: "per month",
      noCommitment: "No commitment",
      cycles: {
        mensal: { label: "Monthly", shortLabel: "monthly", savings: null },
        trimestral: { label: "Quarterly", shortLabel: "quarterly", savings: "5% OFF" },
        semestral: { label: "Semiannual", shortLabel: "semiannual", savings: "10% OFF" },
        anual: { label: "Annual", shortLabel: "annual", savings: "15% OFF" },
      },
      planCopy: {
        agenda: { name: "Silver", badge: "Essential booking", subtitle: "Ideal for barbershops that want online bookings without complexity.", items: ["Online booking", "Booking control", "Financial summary", "Public barbershop page", "Initial operation support"] },
        completo: { name: "Gold", badge: "Complete panel", subtitle: "Complete package to run the barbershop with full management.", items: ["Everything from the Silver plan", "Clients, barbers and services", "Products, POS and cash register", "Reports and customization", "Full admin panel"] },
      },
    },
    cta: {
      kicker: "Ready to sell",
      title: "Start with a plan and level up the barbershop operation.",
      description: "NexCut helps you sell subscriptions, organize bookings and control the barbershop with more professionalism.",
      primary: "Start now",
      secondary: "I already have access",
    },
    contact: {
      kicker: "Talk to us",
      title: "Need help choosing a plan or clearing up questions?",
      description: "Our team can guide you on setup, support, plans and the best structure for your barbershop to start safely.",
      instagram: "Talk on Instagram",
      support: "Talk to support",
    },
    footer: { builtBy: "built by", rights: "All rights reserved" },
  },
};

const PROOF_MEDIA = {
  panel: { image: ArteNex, route: "/painel" },
  public: { image: Banercard1, route: "/barbearia/demo" },
  daily: { image: Barbermodel, route: "#planos" },
};

const FALLBACK_PLANOS = [
  { codigo: "agenda", valorMensal: 85, premium: false },
  { codigo: "completo", valorMensal: 130, premium: true },
];

export default function Home() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const heroVideoSrc = "/demo-home.mp4";
  const { language, formatCurrencyFromBrl } = useLocale();
  const copy = HOME_COPY[language] || HOME_COPY["pt-BR"];
  const [cicloAtivo, setCicloAtivo] = useState("mensal");
  const [planos, setPlanos] = useState(FALLBACK_PLANOS);

  const cicloSelecionado = copy.pricing.cycles[cicloAtivo] || copy.pricing.cycles.mensal;

  useEffect(() => {
    let active = true;

    async function carregarPlanos() {
      try {
        const resposta = await getMasterPlanosPublicos();
        if (!active || !Array.isArray(resposta) || resposta.length === 0) return;

        setPlanos(
          resposta.map((item) => ({
            codigo: item.codigo,
            nome: item.nome,
            valorMensal: Number(item.valor_mensal || 0),
            subtitulo: item.descricao || "",
            destaque: item.destaque || "",
            itens: Array.isArray(item.beneficios) ? item.beneficios : [],
            premium: Boolean(item.premium),
          })),
        );
      } catch {
        // Mantem o fallback local enquanto a API nao responde.
      }
    }

    carregarPlanos();
    const intervalId = window.setInterval(carregarPlanos, 12000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const planosOrdenados = useMemo(
    () =>
      planos.map((plano) => {
        const preset = copy.pricing.planCopy[plano.codigo];
        return {
          ...plano,
          nome: preset?.name || plano.nome || "Plano",
          destaque: preset?.badge || plano.destaque || "Plano",
          subtitulo: preset?.subtitle || plano.subtitulo || "",
          itens: preset?.items || plano.itens || [],
        };
      }),
    [copy.pricing.planCopy, planos],
  );

  function getPrecoPlano(valorMensal) {
    const descontos = { mensal: 0, trimestral: 0.05, semestral: 0.1, anual: 0.15 };
    const multiplicadores = { mensal: 1, trimestral: 3, semestral: 6, anual: 12 };
    const desconto = descontos[cicloAtivo] || 0;
    const multiplicador = multiplicadores[cicloAtivo] || 1;
    const total = valorMensal * multiplicador * (1 - desconto);
    const equivalenteMensal = total / multiplicador;

    return {
      totalFormatado: formatCurrencyFromBrl(total),
      mensalFormatado: formatCurrencyFromBrl(equivalenteMensal),
    };
  }

  return (
    <div
      className="landing-page"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(2, 6, 14, 0.76), rgba(2, 6, 14, 0.96)), url(${Fundo})`,
      }}
    >
      <header className="landing-header">
        <Link to="/" className="landing-brand">
          <img src={Logo} alt="NexCut" />
        </Link>

        <nav className="landing-nav">
          <a href="#recursos">{copy.nav.resources}</a>
          <a href="#como-funciona">{copy.nav.how}</a>
          <a href="#planos">{copy.nav.plans}</a>
          <a href="#gestao">{copy.nav.admin}</a>
        </nav>

        <div className="landing-header-actions">
          <LanguageSelector className="landing-language-select" compact />
          <button type="button" className="landing-secondary-btn" onClick={() => navigate("/barbearia/demo")}>
            {copy.header.demo}
          </button>
          <button type="button" className="landing-primary-btn" onClick={() => navigate("/login")}>
            {copy.header.login}
          </button>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-kicker">{copy.hero.kicker}</span>
            <h1>{copy.hero.title}</h1>
            <p>{copy.hero.description}</p>

            <div className="landing-hero-actions">
              <button type="button" className="landing-primary-btn landing-large-btn" onClick={() => navigate("/register")}>
                {copy.hero.primary}
              </button>
              <button type="button" className="landing-secondary-btn landing-large-btn" onClick={() => navigate("/barbearia/demo")}>
                {copy.hero.secondary}
              </button>
            </div>

            <div className="landing-hero-stats">
              {copy.hero.stats.map((item) => (
                <div key={item.title} className="landing-stat-card">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-hero-panel landing-hero-video-shell">
            <div className="landing-window-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="landing-hero-video-meta">
              <span className="landing-video-badge">{copy.hero.videoBadge}</span>
              <p>{copy.hero.videoText}</p>
            </div>

            <div className="landing-hero-video-frame">
              <video className="landing-hero-video" autoPlay muted loop playsInline controls poster={ArteNex}>
                <source src={heroVideoSrc} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <section className="landing-section landing-proof-section">
          <div className="landing-section-head">
            <span className="landing-kicker">{copy.proof.kicker}</span>
            <h2>{copy.proof.title}</h2>
            <p>{copy.proof.description}</p>
          </div>

          <div className="landing-proof-grid">
            {copy.proof.cards.map((item) => (
              <article key={item.code} className="landing-proof-card">
                <div className="landing-proof-media">
                  <img src={PROOF_MEDIA[item.code].image} alt={item.title} />
                  <span className="landing-proof-tag">{item.tag}</span>
                </div>

                <div className="landing-proof-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <button
                    type="button"
                    className="landing-secondary-btn landing-proof-action"
                    onClick={() =>
                      PROOF_MEDIA[item.code].route.startsWith("#")
                        ? document.querySelector(PROOF_MEDIA[item.code].route)?.scrollIntoView({ behavior: "smooth" })
                        : navigate(PROOF_MEDIA[item.code].route)
                    }
                  >
                    {item.action}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="landing-demo-strip">
            <div className="landing-demo-copy">
              <strong>{copy.proof.stripTitle}</strong>
              <p>{copy.proof.stripDescription}</p>
            </div>

            <div className="landing-demo-points">
              {copy.proof.points.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="recursos" className="landing-section">
          <div className="landing-section-head">
            <span className="landing-kicker">{copy.resources.kicker}</span>
            <h2>{copy.resources.title}</h2>
          </div>

          <div className="landing-features-grid">
            {copy.resources.items.map((item) => (
              <article key={item.title} className="landing-feature-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="landing-section">
          <div className="landing-section-head">
            <span className="landing-kicker">{copy.steps.kicker}</span>
            <h2>{copy.steps.title}</h2>
          </div>

          <div className="landing-steps-grid">
            {copy.steps.items.map((item, index) => (
              <article key={`${item}-${index}`} className="landing-step-card">
                <span className="landing-step-number">0{index + 1}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="gestao" className="landing-section landing-admin-section">
          <div className="landing-admin-copy">
            <span className="landing-kicker">{copy.admin.kicker}</span>
            <h2>{copy.admin.title}</h2>
            <p>{copy.admin.description}</p>

            <ul className="landing-admin-list">
              {copy.admin.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="landing-admin-board">
            <div className="landing-board-column">
              <h3>{copy.admin.boardTitles.shop}</h3>
              <div className="landing-board-box">
                {copy.admin.boardShop.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
            <div className="landing-board-column">
              <h3>{copy.admin.boardTitles.website}</h3>
              <div className="landing-board-box">
                {copy.admin.boardWebsite.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="planos" className="landing-section">
          <div className="landing-section-head">
            <span className="landing-kicker">{copy.pricing.kicker}</span>
            <h2>{copy.pricing.title}</h2>
            <p>{copy.pricing.description}</p>
          </div>

          <div className="landing-billing-toggle" role="tablist" aria-label="Billing cycles">
            {BILLING_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                className={`landing-billing-chip${cicloAtivo === id ? " is-active" : ""}`}
                onClick={() => setCicloAtivo(id)}
              >
                <span>{copy.pricing.cycles[id].label}</span>
                {copy.pricing.cycles[id].savings ? <small>{copy.pricing.cycles[id].savings}</small> : null}
              </button>
            ))}
          </div>

          <div className="landing-pricing-grid">
            {planosOrdenados.map((plano) => (
              <article key={plano.codigo || plano.nome} className={`landing-pricing-card${plano.premium ? " premium" : ""}`}>
                <span className="landing-plan-badge">{plano.destaque}</span>
                <h3>{plano.nome}</h3>
                <div className="landing-plan-price">
                  <strong>{getPrecoPlano(plano.valorMensal).totalFormatado}</strong>
                  <span>/ {cicloSelecionado.shortLabel}</span>
                </div>
                <div className="landing-plan-meta">
                  <span>{getPrecoPlano(plano.valorMensal).mensalFormatado} {copy.pricing.perMonth}</span>
                  <strong>{cicloSelecionado.savings || copy.pricing.noCommitment}</strong>
                </div>
                <p>{plano.subtitulo}</p>

                <ul>
                  {plano.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={plano.premium ? "landing-primary-btn" : "landing-secondary-btn"}
                  onClick={() => navigate("/register")}
                >
                  {copy.pricing.choose}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-cta-section">
          <div className="landing-cta-card">
            <div>
              <span className="landing-kicker">{copy.cta.kicker}</span>
              <h2>{copy.cta.title}</h2>
              <p>{copy.cta.description}</p>
            </div>

            <div className="landing-cta-actions">
              <button type="button" className="landing-primary-btn landing-large-btn" onClick={() => navigate("/register")}>
                {copy.cta.primary}
              </button>
              <button type="button" className="landing-ghost-btn landing-large-btn" onClick={() => navigate("/login")}>
                {copy.cta.secondary}
              </button>
            </div>
          </div>
        </section>

        <section className="landing-section landing-contact-section">
          <div className="landing-contact-copy">
            <span className="landing-kicker">{copy.contact.kicker}</span>
            <h2>{copy.contact.title}</h2>
            <p>{copy.contact.description}</p>
          </div>

          <div className="landing-contact-actions">
            <a className="landing-contact-btn landing-contact-instagram" href="https://www.instagram.com/nextechsolutions/" target="_blank" rel="noreferrer">
              <FiInstagram />
              <span>{copy.contact.instagram}</span>
            </a>

            <a className="landing-contact-btn landing-contact-whatsapp" href="https://wa.me/" target="_blank" rel="noreferrer">
              <IoLogoWhatsapp />
              <span>{copy.contact.support}</span>
            </a>

            <a className="landing-contact-btn landing-contact-email" href="mailto:suporte@NexCut.com">
              <FiHeadphones />
              <span>suporte@NexCut.com</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p className="landing-footer-text">
          <strong>NexCut</strong> {copy.footer.builtBy}{" "}
          <a
            className="landing-footer-link"
            href="https://nextechsolutions25.github.io/Nex-Tech-Solutions/index.html?fbclid=PAQ0xDSwMQp-tleHRuA2FlbQIxMQABp-_uiBDISjxPII2ZKghP1ETPt3tL7ewtCJoYUZsGiOrbGk2UENZ7obFLYyzn_aem_WxgrIflOK0SRC9kUWQtncg"
            target="_blank"
            rel="noreferrer"
          >
            NexTech Solution
          </a>{" "}
          • {copy.footer.rights} © {currentYear}
        </p>
      </footer>
    </div>
  );
}



