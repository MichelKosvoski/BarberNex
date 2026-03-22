import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import { registerUser, setSessionUser } from "../../services/api";
import "../../styles/auth.css";
import "../../styles/register.css";

export default function Register() {
  const navigate = useNavigate();
  const [type, setType] = useState("cliente");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas nao coincidem");
      return;
    }

    setLoading(true);

    try {
      const resposta = await registerUser({
        nome: formData.name,
        email: formData.email,
        telefone: formData.phone,
        cpf: formData.cpf,
        senha: formData.password,
        tipo: "cliente",
      });

      setSessionUser(resposta.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

            {error ? <p className="auth-error">{error}</p> : null}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Criando..." : "Criar conta"}
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
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
