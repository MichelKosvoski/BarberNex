import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiHome,
  FiImage,
  FiPackage,
  FiRepeat,
  FiScissors,
  FiSettings,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { RiAdminLine } from "react-icons/ri";
import {
  canAccessPainelFeature,
  getAgendamentosPainel,
  getBarbearia,
  getPainelBarbeariaId,
  getSessionUser,
} from "../../services/api";
import LanguageSelector from "../../components/LanguageSelector";
import { useLocale } from "../../context/LocaleContext";
import "../../styles/painel.css";

export default function PainelLayout() {
  const { language, locale } = useLocale();
  const [barbearia, setBarbearia] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const [painelNotificacoesAberto, setPainelNotificacoesAberto] = useState(false);
  const ultimaLeituraRef = useRef(new Set());
  const user = getSessionUser();
  const copy =
    language === "es"
      ? {
          brandTitle: "Panel",
          kicker: "Barberia activa",
          loadingShop: "Cargando barberia",
          newBooking: "Nueva reserva",
          nextAppointment: "Atencion proxima",
          menuPrincipal: [
            { to: "/painel", label: "Panel", icon: FiHome, end: true, feature: "painel" },
            { to: "/painel/agenda", label: "Agenda", icon: FiCalendar, feature: "agenda" },
            { to: "/painel/clientes", label: "Clientes", icon: FiUsers, feature: "clientes" },
            { to: "/painel/barbeiros", label: "Barberos", icon: FiScissors, feature: "barbeiros" },
            { to: "/painel/servicos", label: "Servicios", icon: FiShoppingBag, feature: "servicos" },
            { to: "/painel/produtos", label: "Productos", icon: FiPackage, feature: "produtos" },
            { to: "/painel/relatorios", label: "Informes", icon: FiBarChart2, feature: "relatorios" },
            { to: "/painel/assinaturas", label: "Suscripciones", icon: FiRepeat, feature: "assinaturas" },
            { to: "/painel/pdv", label: "Punto de venta", icon: FiCreditCard, feature: "pdv" },
            { to: "/painel/personalizar", label: "Personalizar sitio", icon: FiImage, feature: "personalizar" },
          ],
          menuSecundario: [{ to: "/painel/configuracoes", label: "Configuraciones", icon: FiSettings, feature: "configuracoes" }],
        }
      : language === "en"
        ? {
            brandTitle: "Panel",
            kicker: "Active barbershop",
            loadingShop: "Loading barbershop",
            newBooking: "New booking",
            nextAppointment: "Upcoming appointment",
            menuPrincipal: [
              { to: "/painel", label: "Dashboard", icon: FiHome, end: true, feature: "painel" },
              { to: "/painel/agenda", label: "Booking", icon: FiCalendar, feature: "agenda" },
              { to: "/painel/clientes", label: "Clients", icon: FiUsers, feature: "clientes" },
              { to: "/painel/barbeiros", label: "Barbers", icon: FiScissors, feature: "barbeiros" },
              { to: "/painel/servicos", label: "Services", icon: FiShoppingBag, feature: "servicos" },
              { to: "/painel/produtos", label: "Products", icon: FiPackage, feature: "produtos" },
              { to: "/painel/relatorios", label: "Reports", icon: FiBarChart2, feature: "relatorios" },
              { to: "/painel/assinaturas", label: "Memberships", icon: FiRepeat, feature: "assinaturas" },
              { to: "/painel/pdv", label: "POS", icon: FiCreditCard, feature: "pdv" },
              { to: "/painel/personalizar", label: "Customize site", icon: FiImage, feature: "personalizar" },
            ],
            menuSecundario: [{ to: "/painel/configuracoes", label: "Settings", icon: FiSettings, feature: "configuracoes" }],
          }
        : {
            brandTitle: "Painel",
            kicker: "Barbearia ativa",
            loadingShop: "Carregando barbearia",
            newBooking: "Novo agendamento",
            nextAppointment: "Atendimento proximo",
            menuPrincipal: [
              { to: "/painel", label: "Painel", icon: FiHome, end: true, feature: "painel" },
              { to: "/painel/agenda", label: "Agenda", icon: FiCalendar, feature: "agenda" },
              { to: "/painel/clientes", label: "Clientes", icon: FiUsers, feature: "clientes" },
              { to: "/painel/barbeiros", label: "Barbeiros", icon: FiScissors, feature: "barbeiros" },
              { to: "/painel/servicos", label: "Servicos", icon: FiShoppingBag, feature: "servicos" },
              { to: "/painel/produtos", label: "Produtos", icon: FiPackage, feature: "produtos" },
              { to: "/painel/relatorios", label: "Relatorios", icon: FiBarChart2, feature: "relatorios" },
              { to: "/painel/assinaturas", label: "Assinaturas", icon: FiRepeat, feature: "assinaturas" },
              { to: "/painel/pdv", label: "PDV", icon: FiCreditCard, feature: "pdv" },
              { to: "/painel/personalizar", label: "Personalizar site", icon: FiImage, feature: "personalizar" },
            ],
            menuSecundario: [{ to: "/painel/configuracoes", label: "Configuracoes", icon: FiSettings, feature: "configuracoes" }],
          };

  function tocarAlerta() {
    try {
      const context = new window.AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      gainNode.gain.setValueAtTime(0.0001, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.36);
    } catch (error) {
      console.error("Nao foi possivel tocar o alerta:", error);
    }
  }

  function formatarHora(hora) {
    return String(hora || "").slice(0, 5);
  }

  const formatarData = useCallback((data) => {
    if (!data) return "--";
    const value = new Date(data);
    return Number.isNaN(value.getTime())
      ? String(data)
      : value.toLocaleDateString(locale);
  }, [locale]);

  useEffect(() => {
    const barbeariaId = getPainelBarbeariaId();

    async function carregarBarbearia() {
      try {
        const data = await getBarbearia(barbeariaId);
        setBarbearia(data);
      } catch (error) {
        console.error("Erro ao carregar dados da barbearia:", error);
      }
    }

    carregarBarbearia();
  }, [copy.newBooking, copy.nextAppointment, formatarData]);

  useEffect(() => {
    const barbeariaId = getPainelBarbeariaId();

    async function carregarAlertas() {
      try {
        const agenda = await getAgendamentosPainel(barbeariaId);
        const agora = new Date();
        const itens = [];
        const idsAtuais = new Set();

        (Array.isArray(agenda) ? agenda : []).forEach((item) => {
          idsAtuais.add(item.id);

          if (!ultimaLeituraRef.current.has(item.id)) {
            itens.push({
              id: `novo-${item.id}`,
              tipo: "novo",
              titulo: copy.newBooking,
              descricao: `${item.cliente_nome} marcou ${item.servico_nome} com ${item.barbeiro_nome}.`,
              horario: `${formatarData(item.data)} as ${formatarHora(item.hora)}`,
            });
          }

          if (item.status === "cancelado" || item.status === "finalizado") {
            return;
          }

          const horario = new Date(`${item.data}T${formatarHora(item.hora)}:00`);
          if (Number.isNaN(horario.getTime())) {
            return;
          }

          const minutos = Math.round((horario.getTime() - agora.getTime()) / 60000);
          if (minutos >= 0 && minutos <= 15) {
            itens.push({
              id: `proximo-${item.id}`,
              tipo: "proximo",
              titulo: copy.nextAppointment,
              descricao: `${item.cliente_nome} com ${item.barbeiro_nome}.`,
              horario: `Faltam ${minutos} min`,
            });
          }
        });

        const unicos = [];
        const vistos = new Set();

        itens.forEach((item) => {
          if (!vistos.has(item.id)) {
            vistos.add(item.id);
            unicos.push(item);
          }
        });

        if (
          unicos.length > 0 &&
          ultimaLeituraRef.current.size > 0 &&
          unicos.some((item) => item.tipo === "novo")
        ) {
          tocarAlerta();
        }

        ultimaLeituraRef.current = idsAtuais;
        setNotificacoes(unicos);
      } catch (error) {
        console.error("Erro ao carregar notificacoes da agenda:", error);
      }
    }

    carregarAlertas();
    const interval = window.setInterval(carregarAlertas, 30000);

    return () => window.clearInterval(interval);
  }, [copy.newBooking, copy.nextAppointment, formatarData]);

  const totalNotificacoes = notificacoes.length;
  const notificacoesExibidas = useMemo(() => notificacoes.slice(0, 6), [notificacoes]);
  const menuPrincipalFiltrado = useMemo(
    () => copy.menuPrincipal.filter((item) => canAccessPainelFeature(item.feature, user?.plano)),
    [copy.menuPrincipal, user?.plano],
  );
  const menuSecundarioFiltrado = useMemo(
    () => copy.menuSecundario.filter((item) => canAccessPainelFeature(item.feature, user?.plano)),
    [copy.menuSecundario, user?.plano],
  );

  return (
    <div className="painel-shell">
      <aside className="painel-sidebar">
        <div>
          <div className="painel-brand">
            <div className="painel-brand-mark">
              <FiScissors />
            </div>

            <div>
              <p className="painel-brand-eyebrow">NexCut</p>
              <h1>{copy.brandTitle}</h1>
            </div>
          </div>

          <nav className="painel-nav">
            {menuPrincipalFiltrado.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `painel-nav-link ${isActive ? "is-active" : ""}`
                  }
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="painel-sidebar-footer">
          {menuSecundarioFiltrado.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `painel-nav-link ${isActive ? "is-active" : ""}`
                }
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>

      <main className="painel-main">
        <header className="painel-topbar">
          <div>
            <p className="painel-topbar-kicker">{copy.kicker}</p>
            <h2>{barbearia?.nome || copy.loadingShop}</h2>
          </div>

          <div className="painel-topbar-actions">
            <LanguageSelector className="painel-language-select" compact />
            <button className="painel-icon-button" type="button">
              <FiClock />
            </button>

            <button
              className="painel-icon-button painel-icon-button-notify"
              type="button"
              onClick={() => setPainelNotificacoesAberto((prev) => !prev)}
            >
              <IoNotificationsOutline />
              {totalNotificacoes > 0 ? (
                <span className="painel-notify-badge">{totalNotificacoes}</span>
              ) : null}
            </button>

            <div className="painel-user-chip">
              <div className="painel-user-avatar">
                <RiAdminLine />
              </div>
              <div>
                <strong>{user?.tipo === "funcionario" ? "Funcionario" : "Administrador"}</strong>
                <span>{user?.plano || barbearia?.plano || "Plano base"}</span>
              </div>
            </div>
          </div>
        </header>

        {painelNotificacoesAberto ? (
          <div className="painel-notify-panel">
            <div className="painel-notify-header">
              <strong>Alertas da agenda</strong>
              <button
                type="button"
                className="painel-table-btn is-ghost"
                onClick={() => setPainelNotificacoesAberto(false)}
              >
                Fechar
              </button>
            </div>

            <div className="painel-notify-list">
              {notificacoesExibidas.length > 0 ? (
                notificacoesExibidas.map((item) => (
                  <article key={item.id} className={`painel-notify-item is-${item.tipo}`}>
                    <strong>{item.titulo}</strong>
                    <p>{item.descricao}</p>
                    <span>{item.horario}</span>
                  </article>
                ))
              ) : (
                <div className="painel-empty-state">Sem alertas no momento.</div>
              )}
            </div>
          </div>
        ) : null}

        <Outlet />
      </main>
    </div>
  );
}

