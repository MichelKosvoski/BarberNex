import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeadphones, FiInstagram } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io";
import { getMasterPlanosPublicos } from "../../services/api";
import Logo from "../../assets/Logo.png";
import Fundo from "../../assets/Fundo.png";
import ArteNex from "../../assets/ArteNex.png";
import Banercard1 from "../../assets/Banercard1.png";
import Barbermodel from "../../assets/Barbermodel.png";
import "../../styles/home.css";

const recursos = [
  {
    titulo: "Agenda online",
    descricao:
      "Receba agendamentos 24 horas por dia com um fluxo simples para o cliente e controle imediato para a barbearia.",
  },
  {
    titulo: "Painel administrativo",
    descricao:
      "Gerencie barbeiros, serviços, clientes, produtos, caixa, relatórios e personalização do site em um só lugar.",
  },
  {
    titulo: "Página pública da barbearia",
    descricao:
      "Cada barbearia ganha sua própria vitrine com identidade visual, banner, logo, planos e link exclusivo.",
  },
  {
    titulo: "Controle comercial",
    descricao:
      "Acompanhe entradas, saídas e o desempenho da operação para crescer com mais clareza e segurança.",
  },
];

const etapas = [
  "A barbearia contrata um plano e recebe acesso ao sistema.",
  "O dono configura equipe, serviços, produtos, horários e o visual da página.",
  "O cliente agenda online e a barbearia acompanha tudo pelo painel.",
  "A operação fica centralizada para vender mais, atender melhor e manter o negócio organizado.",
];

const provasVisuais = [
  {
    titulo: "Painel da barbearia",
    descricao:
      "Agenda, clientes, barbeiros, serviços, produtos, PDV e relatórios em uma tela profissional.",
    imagem: ArteNex,
    tag: "Painel admin",
    acao: "Ver painel",
    rota: "/painel",
  },
  {
    titulo: "Página pública pronta para vender",
    descricao:
      "Cada barbearia ganha sua própria página com banner, planos, agendamento e identidade visual.",
    imagem: Banercard1,
    tag: "Página pública",
    acao: "Ver demonstração",
    rota: "/barbearia/demo",
  },
  {
    titulo: "Operação organizada no dia a dia",
    descricao:
      "Tenha uma visão mais profissional da rotina da barbearia com agenda, operação e apresentação comercial alinhadas.",
    imagem: Barbermodel,
    tag: "Gestão diária",
    acao: "Conhecer planos",
    rota: "#planos",
  },
];

const ciclos = [
  { id: "mensal", label: "Mensal", multiplicador: 1, economia: null },
  { id: "trimestral", label: "Trimestral", multiplicador: 3, economia: "5% OFF" },
  { id: "semestral", label: "Semestral", multiplicador: 6, economia: "10% OFF" },
  { id: "anual", label: "Anual", multiplicador: 12, economia: "15% OFF" },
];

const fallbackPlanos = [
  {
    codigo: "agenda",
    nome: "Prata",
    valorMensal: 85,
    subtitulo: "Ideal para quem quer vender agenda online sem complexidade.",
    destaque: "Agenda essencial",
    itens: [
      "Agenda online",
      "Controle de agendamentos",
      "Resumo financeiro",
      "Página pública da barbearia",
      "Suporte para operação inicial",
    ],
  },
  {
    codigo: "completo",
    nome: "Gold",
    valorMensal: 130,
    subtitulo: "Pacote completo para operar a barbearia com administração total.",
    destaque: "Painel completo",
    itens: [
      "Tudo do plano Prata",
      "Clientes, barbeiros e serviços",
      "Produtos, PDV e caixa",
      "Relatórios e personalização",
      "Painel administrativo completo",
    ],
    premium: true,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const heroVideoSrc = "/demo-home.mp4";
  const currentYear = new Date().getFullYear();
  const [cicloAtivo, setCicloAtivo] = useState("mensal");
  const [planos, setPlanos] = useState(fallbackPlanos);

  const cicloSelecionado = ciclos.find((ciclo) => ciclo.id === cicloAtivo) || ciclos[0];

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
            subtitulo: item.descricao || "Plano da plataforma NexBarber.",
            destaque: item.destaque || "Plano",
            itens: Array.isArray(item.beneficios) ? item.beneficios : [],
            premium: Boolean(item.premium),
          })),
        );
      } catch {
        // Mantem fallback local se a API ainda nao estiver pronta.
      }
    }

    carregarPlanos();
    const intervalId = setInterval(carregarPlanos, 12000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const planosOrdenados = useMemo(() => planos, [planos]);

  function getPrecoPlano(valorMensal) {
    const descontos = {
      mensal: 0,
      trimestral: 0.05,
      semestral: 0.1,
      anual: 0.15,
    };

    const desconto = descontos[cicloSelecionado.id] || 0;
    const total = valorMensal * cicloSelecionado.multiplicador * (1 - desconto);
    const equivalenteMensal = total / cicloSelecionado.multiplicador;

    return {
      totalFormatado: total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      mensalFormatado: equivalenteMensal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
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
          <img src={Logo} alt="NexBarber" />
        </Link>

        <nav className="landing-nav">
          <a href="#recursos">Recursos</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#planos">Planos</a>
          <a href="#gestao">Painel admin</a>
        </nav>

        <div className="landing-header-actions">
          <button
            type="button"
            className="landing-secondary-btn"
            onClick={() => navigate("/barbearia/demo")}
          >
            Ver demonstração
          </button>
          <button
            type="button"
            className="landing-primary-btn"
            onClick={() => navigate("/login")}
          >
            Entrar / Registrar
          </button>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-kicker">Plataforma para barbearias</span>
            <h1>
              Mostre sua barbearia profissionalmente,
              <br />
              receba agendamentos e controle tudo
              <br />
              em um sistema que o cliente entende na hora.
            </h1>
            <p>
              O NexBarber reúne agenda online, painel administrativo, clientes,
              produtos, PDV, relatórios e página própria da barbearia em uma
              estrutura feita para vender assinaturas e organizar a operação.
            </p>

            <div className="landing-hero-actions">
              <button
                type="button"
                className="landing-primary-btn landing-large-btn"
                onClick={() => navigate("/register")}
              >
                Cadastrar barbearia
              </button>
              <button
                type="button"
                className="landing-secondary-btn landing-large-btn"
                onClick={() => navigate("/barbearia/demo")}
              >
                Ver demonstração
              </button>
            </div>

            <div className="landing-hero-stats">
              <div className="landing-stat-card">
                <strong>Agenda online</strong>
                <span>O cliente agenda em poucos cliques</span>
              </div>
              <div className="landing-stat-card">
                <strong>Painel admin</strong>
                <span>Controle diário da operação</span>
              </div>
              <div className="landing-stat-card">
                <strong>Personalização</strong>
                <span>Site da barbearia com identidade própria</span>
              </div>
            </div>
          </div>

          <div className="landing-hero-panel landing-hero-video-shell">
            <div className="landing-window-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="landing-hero-video-meta">
              <span className="landing-video-badge">Demonstração real</span>
              <p>Adicione um vídeo mostrando agenda, painel admin, PDV e a página da barbearia em funcionamento.</p>
            </div>

            <div className="landing-hero-video-frame">
              <video
                className="landing-hero-video"
                autoPlay
                muted
                loop
                playsInline
                controls
                poster={ArteNex}
              >
                <source src={heroVideoSrc} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <section className="landing-section landing-proof-section">
          <div className="landing-section-head">
            <span className="landing-kicker">Prova visual do produto</span>
            <h2>Veja o sistema funcionando antes de contratar.</h2>
            <p>
              Em vez de prometer no texto, o NexBarber mostra na prática como a
              barbearia vai vender, organizar a agenda e controlar o negócio.
            </p>
          </div>

          <div className="landing-proof-grid">
            {provasVisuais.map((item) => (
              <article key={item.titulo} className="landing-proof-card">
                <div className="landing-proof-media">
                  <img src={item.imagem} alt={item.titulo} />
                  <span className="landing-proof-tag">{item.tag}</span>
                </div>

                <div className="landing-proof-copy">
                  <h3>{item.titulo}</h3>
                  <p>{item.descricao}</p>
                  <button
                    type="button"
                    className="landing-secondary-btn landing-proof-action"
                    onClick={() =>
                      item.rota.startsWith("#")
                        ? document.querySelector(item.rota)?.scrollIntoView({ behavior: "smooth" })
                        : navigate(item.rota)
                    }
                  >
                    {item.acao}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="landing-demo-strip">
            <div className="landing-demo-copy">
              <strong>O cliente não compra só texto. Ele compra clareza.</strong>
              <p>
                Mostre agenda, painel, página pública e operação real. Isso
                reduz dúvidas e aumenta a conversão da assinatura.
              </p>
            </div>

            <div className="landing-demo-points">
              <span>Agenda online real</span>
              <span>Painel com operação diária</span>
              <span>Página pública com identidade visual</span>
              <span>Fluxo comercial mais organizado</span>
            </div>
          </div>
        </section>

        <section id="recursos" className="landing-section">
          <div className="landing-section-head">
            <span className="landing-kicker">Recursos do sistema</span>
            <h2>Um sistema só para vender, operar e administrar a barbearia.</h2>
          </div>

          <div className="landing-features-grid">
            {recursos.map((recurso) => (
              <article key={recurso.titulo} className="landing-feature-card">
                <h3>{recurso.titulo}</h3>
                <p>{recurso.descricao}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="landing-section">
          <div className="landing-section-head">
            <span className="landing-kicker">Como funciona</span>
            <h2>Fluxo simples para você operar e escalar o NexBarber.</h2>
          </div>

          <div className="landing-steps-grid">
            {etapas.map((etapa, index) => (
              <article key={etapa} className="landing-step-card">
                <span className="landing-step-number">0{index + 1}</span>
                <p>{etapa}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="gestao" className="landing-section landing-admin-section">
          <div className="landing-admin-copy">
            <span className="landing-kicker">Painel administrativo</span>
            <h2>O dono controla a operação. O funcionário executa sem bagunça.</h2>
            <p>
              No painel da barbearia você acompanha agenda, clientes,
              barbeiros, serviços, produtos, PDV, relatórios e personalização
              do site em uma estrutura feita para o dia a dia da equipe.
            </p>

            <ul className="landing-admin-list">
              <li>Agenda com remarcação, cancelamento e confirmação.</li>
              <li>Cadastro de serviços, barbeiros, produtos e clientes.</li>
              <li>PDV para venda de itens de espera e atendimento.</li>
              <li>Relatórios de entradas, saídas, lucro bruto e líquido.</li>
              <li>Personalização visual da página pública da barbearia.</li>
            </ul>
          </div>

          <div className="landing-admin-board">
            <div className="landing-board-column">
              <h3>Barbearia</h3>
              <div className="landing-board-box">
                <span>Agenda</span>
                <span>Clientes</span>
                <span>Serviços</span>
                <span>Produtos</span>
                <span>PDV</span>
                <span>Relatórios</span>
              </div>
            </div>
            <div className="landing-board-column">
              <h3>Site da barbearia</h3>
              <div className="landing-board-box">
                <span>Banner</span>
                <span>Logo</span>
                <span>Planos</span>
                <span>Agendamento</span>
                <span>Identidade visual</span>
                <span>Link exclusivo</span>
              </div>
            </div>
          </div>
        </section>

        <section id="planos" className="landing-section">
          <div className="landing-section-head">
            <span className="landing-kicker">Planos do NexBarber</span>
            <h2>Escolha o nível de operação ideal para cada barbearia.</h2>
            <p>
              Selecione o ciclo de pagamento ideal para sua operação. Quanto maior o período,
              maior a economia no valor final.
            </p>
          </div>

          <div className="landing-billing-toggle" role="tablist" aria-label="Ciclos de cobrança">
            {ciclos.map((ciclo) => (
              <button
                key={ciclo.id}
                type="button"
                className={`landing-billing-chip${cicloAtivo === ciclo.id ? " is-active" : ""}`}
                onClick={() => setCicloAtivo(ciclo.id)}
              >
                <span>{ciclo.label}</span>
                {ciclo.economia ? <small>{ciclo.economia}</small> : null}
              </button>
            ))}
          </div>

          <div className="landing-pricing-grid">
            {planosOrdenados.map((plano) => (
              <article
                key={plano.codigo || plano.nome}
                className={`landing-pricing-card${plano.premium ? " premium" : ""}`}
              >
                <span className="landing-plan-badge">{plano.destaque}</span>
                <h3>{plano.nome}</h3>
                <div className="landing-plan-price">
                  <strong>{getPrecoPlano(plano.valorMensal).totalFormatado}</strong>
                  <span>/ {cicloSelecionado.label.toLowerCase()}</span>
                </div>
                <div className="landing-plan-meta">
                  <span>{getPrecoPlano(plano.valorMensal).mensalFormatado} por mês</span>
                  {cicloSelecionado.economia ? (
                    <strong>{cicloSelecionado.economia}</strong>
                  ) : (
                    <strong>Sem fidelidade</strong>
                  )}
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
                  Quero esse plano
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-cta-section">
          <div className="landing-cta-card">
            <div>
              <span className="landing-kicker">Pronto para vender</span>
              <h2>Comece com um plano e evolua a operação da barbearia.</h2>
              <p>
                O NexBarber ajuda você a vender assinaturas, organizar a agenda e
                controlar a barbearia com mais profissionalismo.
              </p>
            </div>

            <div className="landing-cta-actions">
              <button
                type="button"
                className="landing-primary-btn landing-large-btn"
                onClick={() => navigate("/register")}
              >
                Começar agora
              </button>
              <button
                type="button"
                className="landing-ghost-btn landing-large-btn"
                onClick={() => navigate("/login")}
              >
                Já tenho acesso
              </button>
            </div>
          </div>
        </section>

        <section className="landing-section landing-contact-section">
          <div className="landing-contact-copy">
            <span className="landing-kicker">Fale conosco</span>
            <h2>Precisa de ajuda para escolher o plano ou tirar dúvidas?</h2>
            <p>
              Nossa equipe pode te orientar sobre implantação, suporte, planos e a melhor
              estrutura para a sua barbearia começar com segurança.
            </p>
          </div>

          <div className="landing-contact-actions">
            <a
              className="landing-contact-btn landing-contact-instagram"
              href="https://www.instagram.com/nextechsolutions/"
              target="_blank"
              rel="noreferrer"
            >
              <FiInstagram />
              <span>Falar pelo Instagram</span>
            </a>

            <a
              className="landing-contact-btn landing-contact-whatsapp"
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
            >
              <IoLogoWhatsapp />
              <span>Falar com suporte</span>
            </a>

            <a
              className="landing-contact-btn landing-contact-email"
              href="mailto:suporte@nexbarber.com"
            >
              <FiHeadphones />
              <span>suporte@nexbarber.com</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p className="landing-footer-text">
          <strong>NexBarber</strong> desenvolvida pela{" "}
          <a
            className="landing-footer-link"
            href="https://nextechsolutions25.github.io/Nex-Tech-Solutions/index.html?fbclid=PAQ0xDSwMQp-tleHRuA2FlbQIxMQABp-_uiBDISjxPII2ZKghP1ETPt3tL7ewtCJoYUZsGiOrbGk2UENZ7obFLYyzn_aem_WxgrIflOK0SRC9kUWQtncg"
            target="_blank"
            rel="noreferrer"
          >
            NexTech Solution
          </a>
          {" "}•{" "}Todos os direitos reservados © {currentYear}
        </p>
      </footer>
    </div>
  );
}
