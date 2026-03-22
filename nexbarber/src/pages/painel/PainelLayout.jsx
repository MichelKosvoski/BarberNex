import { useEffect, useState } from "react";
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
import { getBarbearia, getPainelBarbeariaId } from "../../services/api";
import "../../styles/painel.css";

const menuPrincipal = [
  { to: "/painel", label: "Painel", icon: FiHome, end: true },
  { to: "/painel/agenda", label: "Agenda", icon: FiCalendar },
  { to: "/painel/clientes", label: "Clientes", icon: FiUsers },
  { to: "/painel/barbeiros", label: "Barbeiros", icon: FiScissors },
  { to: "/painel/servicos", label: "Servicos", icon: FiShoppingBag },
  { to: "/painel/produtos", label: "Produtos", icon: FiPackage },
  { to: "/painel/relatorios", label: "Relatorios", icon: FiBarChart2 },
  { to: "/painel/assinaturas", label: "Assinaturas", icon: FiRepeat },
  { to: "/painel/pdv", label: "PDV", icon: FiCreditCard },
  { to: "/painel/personalizar", label: "Personalizar Site", icon: FiImage },
];

const menuSecundario = [
  { to: "/painel/configuracoes", label: "Configuracoes", icon: FiSettings },
];

export default function PainelLayout() {
  const [barbearia, setBarbearia] = useState(null);

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
  }, []);

  return (
    <div className="painel-shell">
      <aside className="painel-sidebar">
        <div>
          <div className="painel-brand">
            <div className="painel-brand-mark">
              <FiScissors />
            </div>

            <div>
              <p className="painel-brand-eyebrow">NexBarber</p>
              <h1>Painel</h1>
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
            <p className="painel-topbar-kicker">Barbearia ativa</p>
            <h2>{barbearia?.nome || "Carregando barbearia"}</h2>
          </div>

          <div className="painel-topbar-actions">
            <button className="painel-icon-button" type="button">
              <FiClock />
            </button>
            <button className="painel-icon-button" type="button">
              <IoNotificationsOutline />
            </button>
            <div className="painel-user-chip">
              <div className="painel-user-avatar">
                <RiAdminLine />
              </div>
              <div>
                <strong>Administrador</strong>
                <span>{barbearia?.plano || "Plano base"}</span>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
