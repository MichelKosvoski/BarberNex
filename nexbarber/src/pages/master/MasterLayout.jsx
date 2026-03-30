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
import "../../styles/painel.css";

const menuPrincipal = [
  { to: "/master", label: "Painel Master", icon: FiHome, end: true },
  { to: "/master/barbearias", label: "Barbearias", icon: FiBriefcase },
  { to: "/master/planos", label: "Planos", icon: FiLayers },
  { to: "/master/usuarios", label: "Usuarios", icon: FiUsers },
  { to: "/master/pagamentos", label: "Pagamentos", icon: FiCreditCard },
];

const menuSecundario = [
  { to: "/master/relatorios", label: "Relatorios", icon: FiBarChart2 },
  { to: "/master/configuracoes", label: "Configuracoes", icon: FiSettings },
];

export default function MasterLayout() {
  return (
    <div className="painel-shell master-shell">
      <aside className="painel-sidebar">
        <div>
          <div className="painel-brand">
            <div className="painel-brand-mark">
              <RiAdminLine />
            </div>

            <div>
              <p className="painel-brand-eyebrow">NexBarber</p>
              <h1>Master</h1>
            </div>
          </div>

          <nav className="painel-nav">
            {menuPrincipal.map((item) => {
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
          {menuSecundario.map((item) => {
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
            <p className="painel-topbar-kicker">Controle total da plataforma</p>
            <h2>NexBarber Admin</h2>
          </div>

          <div className="painel-user-chip">
            <div className="painel-user-avatar">
              <RiAdminLine />
            </div>
            <div>
              <strong>Master</strong>
              <span>Gestao da plataforma</span>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
