import { NavLink, Outlet } from "react-router-dom";
import {
  FiBarChart2,
  FiBriefcase,
  FiCreditCard,
  FiHome,
  FiSettings,
  FiUsers,
  FiLayers,
} from "react-icons/fi";
import { RiAdminLine } from "react-icons/ri";
import LanguageSelector from "../../components/LanguageSelector";
import { useLocale } from "../../context/LocaleContext";
import "../../styles/painel.css";

export default function MasterLayout() {
  const { language } = useLocale();
  const copy =
    language === "es"
      ? {
          kicker: "Control total de la plataforma",
          subtitle: "Gestion de la plataforma",
          menuPrincipal: [
            { to: "/master", label: "Panel master", icon: FiHome, end: true },
            { to: "/master/barbearias", label: "Barberias", icon: FiBriefcase },
            { to: "/master/planos", label: "Planes", icon: FiLayers },
            { to: "/master/usuarios", label: "Usuarios", icon: FiUsers },
            { to: "/master/pagamentos", label: "Pagos", icon: FiCreditCard },
          ],
          menuSecundario: [
            { to: "/master/relatorios", label: "Informes", icon: FiBarChart2 },
            { to: "/master/configuracoes", label: "Configuraciones", icon: FiSettings },
          ],
        }
      : language === "en"
        ? {
            kicker: "Full platform control",
            subtitle: "Platform management",
            menuPrincipal: [
              { to: "/master", label: "Master panel", icon: FiHome, end: true },
              { to: "/master/barbearias", label: "Barbershops", icon: FiBriefcase },
              { to: "/master/planos", label: "Plans", icon: FiLayers },
              { to: "/master/usuarios", label: "Users", icon: FiUsers },
              { to: "/master/pagamentos", label: "Payments", icon: FiCreditCard },
            ],
            menuSecundario: [
              { to: "/master/relatorios", label: "Reports", icon: FiBarChart2 },
              { to: "/master/configuracoes", label: "Settings", icon: FiSettings },
            ],
          }
        : {
            kicker: "Controle total da plataforma",
            subtitle: "Gestao da plataforma",
            menuPrincipal: [
              { to: "/master", label: "Painel master", icon: FiHome, end: true },
              { to: "/master/barbearias", label: "Barbearias", icon: FiBriefcase },
              { to: "/master/planos", label: "Planos", icon: FiLayers },
              { to: "/master/usuarios", label: "Usuarios", icon: FiUsers },
              { to: "/master/pagamentos", label: "Pagamentos", icon: FiCreditCard },
            ],
            menuSecundario: [
              { to: "/master/relatorios", label: "Relatorios", icon: FiBarChart2 },
              { to: "/master/configuracoes", label: "Configuracoes", icon: FiSettings },
            ],
          };
  return (
    <div className="painel-shell master-shell">
      <aside className="painel-sidebar">
        <div>
          <div className="painel-brand">
            <div className="painel-brand-mark">
              <RiAdminLine />
            </div>

            <div>
              <p className="painel-brand-eyebrow">NexCut</p>
              <h1>Master</h1>
            </div>
          </div>

          <nav className="painel-nav">
            {copy.menuPrincipal.map((item) => {
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
          {copy.menuSecundario.map((item) => {
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
        </div>
      </aside>

      <main className="painel-main">
        <header className="painel-topbar">
          <div>
            <p className="painel-topbar-kicker">{copy.kicker}</p>
            <h2>NexCut Admin</h2>
          </div>

          <div className="painel-topbar-actions">
            <LanguageSelector className="painel-language-select" compact />
            <div className="painel-user-chip">
              <div className="painel-user-avatar">
                <RiAdminLine />
              </div>
              <div>
                <strong>Master</strong>
                <span>{copy.subtitle}</span>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

