import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import "../../styles/auth.css";
import "../../styles/register.css";

export default function Register() {
  const [type, setType] = useState("cliente");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Máscara telefone
  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);

    setFormData({
      ...formData,
      phone: value,
    });
  };

  // Máscara CPF
  const handleCpfChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);

    setFormData({
      ...formData,
      cpf: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    console.log("Cadastro cliente:", formData);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Olá, quero cadastrar minha barbearia na NexBarber.",
    );
    window.open(`https://wa.me/5567993487826?text=${message}`, "_blank");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img src={Logo} alt="Logo" />
        </div>

        <h3>Criar sua conta</h3>

        {/* Toggle Tipo */}
        <div className="toggle-login">
          <button
            type="button"
            className={type === "cliente" ? "active" : ""}
            onClick={() => setType("cliente")}
          >
            Cliente
          </button>

          <button
            type="button"
            className={type === "barbearia" ? "active" : ""}
            onClick={() => setType("barbearia")}
          >
            Barbearia
          </button>
        </div>

        {type === "cliente" ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Seu email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="(67) 99999-9999"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
            />

            <input
              type="text"
              name="cpf"
              placeholder="Seu CPF"
              value={formData.cpf}
              onChange={handleCpfChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar senha"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" className="primary-btn">
              Criar conta
            </button>
          </form>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <p style={{ color: "#aaa", marginBottom: "20px" }}>
              Para cadastrar sua barbearia, fale direto com nossa equipe.
            </p>

            <button className="primary-btn" onClick={openWhatsApp}>
              Falar no WhatsApp
            </button>
          </div>
        )}

        <p className="auth-link">
          Já tem conta? <Link to="/">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
