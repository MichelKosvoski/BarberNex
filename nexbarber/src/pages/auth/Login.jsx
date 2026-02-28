import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import "../../styles/auth.css";

export default function Login() {
  const [loginType, setLoginType] = useState("email");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ loginType, login, password });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);

    setLogin(value);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img src={Logo} alt="Logo" />
        </div>

        <h3>Acesse sua conta</h3>

        <div className="toggle-login">
          <button
            type="button"
            className={loginType === "email" ? "active" : ""}
            onClick={() => {
              setLoginType("email");
              setLogin("");
            }}
          >
            Email
          </button>

          <button
            type="button"
            className={loginType === "phone" ? "active" : ""}
            onClick={() => {
              setLoginType("phone");
              setLogin("");
            }}
          >
            Telefone
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {loginType === "email" ? (
            <input
              type="email"
              placeholder="Seu email"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          ) : (
            <input
              type="text"
              placeholder="(67) 99999-9999"
              value={login}
              onChange={handlePhoneChange}
              required
            />
          )}

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="primary-btn">
            Entrar
          </button>
        </form>

        <p className="auth-link">
          Não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
