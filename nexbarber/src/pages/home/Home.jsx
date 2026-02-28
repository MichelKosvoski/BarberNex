import { Link, useNavigate } from "react-router-dom";
import Banercard from "../../assets/Banercard1.png";
import Donbigode from "../../assets/Donbigode.png";
import Logo from "../../assets/Logo.png";
import Fundo from "../../assets/Fundo.png";
import "../../styles/home.css";
import { useHome } from "../../hooks/useHome";

export default function Home() {
  const navigate = useNavigate();

  const {
    preco,
    setPreco,
    searchServico,
    setSearchServico,
    setPagina,
    barbearias,
    barbeariasPaginadas,
    servicosFiltrados,
  } = useHome();

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${Fundo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* HEADER */}
      <header className="home-header">
        <div className="logo-area">
          <img src={Logo} alt="logo" />
        </div>

        <nav>
          <Link to="/">Barbearias</Link>
          <Link to="/">Serviços</Link>
          <Link to="/">Barbeiros</Link>
          <Link to="/">Sobre Nós</Link>
          <Link to="/">Suporte</Link>
        </nav>

        <button className="login-btn" onClick={() => navigate("/login")}>
          Entrar / Registrar
        </button>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>
          Encontre a Melhor <span>Barbearia</span> da Sua Região
        </h1>

        <div className="search-bar">
          <input placeholder="Pesquisar barbearia" />
          <input placeholder="Cidade" />

          <select>
            <option>Avaliação</option>
            <option>⭐⭐⭐⭐⭐</option>
            <option>⭐⭐⭐⭐+</option>
          </select>

          <select>
            <option>Preço</option>
            <option>$</option>
            <option>$$</option>
            <option>$$$</option>
          </select>

          <button>Buscar</button>
        </div>
      </section>

      {/* CARROSSEL */}
      <section className="partners-section">
        <h2>
          Nossas <span>Barbearias</span> Parceiras
        </h2>

        <div className="partners-wrapper">
          <div className="partners-track">
            {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((_, i) => (
              <div className="partner-item" key={i}>
                <img src={Donbigode} alt="logo" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="content-area">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <h3 className="filter-title">⚙ Filtros Avançados</h3>

          {/* DISTÂNCIA */}
          <div className="filter-section">
            <h4>Distância</h4>

            <label className="radio-custom">
              <input type="radio" name="distancia" defaultChecked />
              <span className="radio-circle"></span>
              <span>Até 5 km</span>
            </label>

            <label className="radio-custom">
              <input type="radio" name="distancia" />
              <span className="radio-circle"></span>
              <span>Até 10 km</span>
            </label>

            <label className="radio-custom">
              <input type="radio" name="distancia" />
              <span className="radio-circle"></span>
              <span>Até 20 km</span>
            </label>
          </div>

          {/* SERVIÇOS */}
          <div className="filter-section">
            <h4>Serviços</h4>

            <input
              type="text"
              placeholder="Buscar serviço..."
              className="service-search"
              value={searchServico}
              onChange={(e) => setSearchServico(e.target.value)}
            />

            <div className="services-scroll">
              {servicosFiltrados.map((servico, index) => (
                <label key={index} className="check-custom">
                  <div className="left">
                    <span className="yellow-bar"></span>
                    {servico.nome}
                  </div>
                  {servico.total && (
                    <span className="count">{servico.total}</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* PREÇO */}
          <div className="filter-section">
            <h4>Preço</h4>

            <div className="range-wrapper">
              <input
                type="range"
                min="0"
                max="1200"
                value={preco}
                onChange={(e) => setPreco(Number(e.target.value))}
                className="range-slider"
                style={{
                  background: `linear-gradient(to right,
                    ${preco > 600 ? "#3b82f6" : "#facc15"} 0%,
                    ${preco > 600 ? "#3b82f6" : "#facc15"} ${(preco / 1200) * 100}%,
                    #2a2a2a ${(preco / 1200) * 100}%,
                    #2a2a2a 100%)`,
                }}
              />
            </div>

            <div className="price-values">
              <span>R$ 0</span>
              <span>R$ {preco}</span>
            </div>
          </div>

          {/* DISPONIBILIDADE */}
          <div className="filter-section">
            <h4>Disponibilidade</h4>

            <label className="radio-custom">
              <input type="radio" name="status" defaultChecked />
              <span className="radio-circle"></span>
              <span>Aberto agora</span>
            </label>

            <label className="radio-custom">
              <input type="radio" name="status" />
              <span className="radio-circle"></span>
              <span>Agendar Online</span>
            </label>
          </div>

          <button className="clear-btn-premium">Limpar Filtros</button>
        </aside>

        {/* GRID */}
        <div className="barbearias-grid">
          {barbeariasPaginadas.map((b) => (
            <div key={b.id} className="barbearia-card">
              <div className="card-bg">
                <img
                  src={Banercard}
                  alt="background"
                  className="card-background"
                />

                <div className="card-overlay"></div>

                <div className="rating-badge">⭐ {b.avaliacao.toFixed(1)}</div>

                <img src={Donbigode} alt="logo" className="card-logo" />
              </div>

              <div className="card-content">
                <h3>{b.nome}</h3>
                <p className="card-location">{b.cidade}</p>

                <div className="card-tags">
                  <span>Corte</span>
                  <span>Barba</span>
                  <span>{b.preco}</span>
                </div>

                <div className="card-footer">
                  <span
                    className={b.aberto ? "status aberto" : "status fechado"}
                  >
                    {b.aberto ? "🟢 Aberto agora" : "🔴 Fechado"}
                  </span>

                  <button onClick={() => navigate(`/barbearia/${b.id}`)}>
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PAGINAÇÃO */}
      {barbeariasPaginadas.length < barbearias.length && (
        <div className="load-more-wrapper">
          <button
            className="load-more-btn"
            onClick={() => setPagina((prev) => prev + 1)}
          >
            Ver mais barbearias
          </button>
        </div>
      )}

      <footer className="footer">
        © 2028 NexBarber - Todos os direitos reservados
      </footer>
    </div>
  );
}
