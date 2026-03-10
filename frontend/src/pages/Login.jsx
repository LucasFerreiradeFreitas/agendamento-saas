import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    slug: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const { data } = await api.post(endpoint, form);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Algo deu errado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
        }

        .login-left {
          background: linear-gradient(145deg, #4A8C1C 0%, #7AC143 50%, #9ED45A 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -100px;
          right: -100px;
        }

        .login-left::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          bottom: -80px;
          left: -80px;
        }

        .brand-logo {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          color: white;
          line-height: 1;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .brand-tagline {
          color: rgba(255,255,255,0.85);
          font-size: 18px;
          font-weight: 300;
          text-align: center;
          position: relative;
          z-index: 1;
          max-width: 300px;
          line-height: 1.6;
        }

        .brand-badge {
          margin-top: 48px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 16px;
          padding: 24px 32px;
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .brand-badge-number {
          font-family: 'Playfair Display', serif;
          font-size: 40px;
          color: white;
          display: block;
        }

        .brand-badge-label {
          color: rgba(255,255,255,0.8);
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .login-right {
          background: #F5F7F2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
        }

        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          color: #1A2E0A;
          margin-bottom: 8px;
        }

        .login-subtitle {
          color: #7A8A6A;
          font-size: 15px;
          margin-bottom: 40px;
          font-weight: 300;
        }

        .login-error {
          background: #FEE2E2;
          color: #DC2626;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
          border-left: 3px solid #DC2626;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 13px;
          font-weight: 500;
          color: #3A5A1A;
          letter-spacing: 0.3px;
        }

        .login-input {
          padding: 14px 18px;
          border: 1.5px solid #D4E4C0;
          border-radius: 12px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          background: white;
          color: #1A2E0A;
          transition: all 0.2s;
          outline: none;
        }

        .login-input:focus {
          border-color: #7AC143;
          box-shadow: 0 0 0 4px rgba(122,193,67,0.12);
        }

        .login-btn {
          padding: 16px;
          background: linear-gradient(135deg, #4A8C1C, #7AC143);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(74,140,28,0.35);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-toggle {
          text-align: center;
          margin-top: 24px;
          color: #7A8A6A;
          font-size: 14px;
        }

        .login-toggle-link {
          color: #4A8C1C;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { padding: 40px 24px; min-height: 200px; }
          .brand-logo { font-size: 36px; }
          .login-right { padding: 40px 24px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-left">
          <div className="brand-logo">
            📅 Agenda
            <br />
            Pro
          </div>
          <p className="brand-tagline">
            Simplifique seus agendamentos e foque no que realmente importa
          </p>
          <div className="brand-badge">
            <span className="brand-badge-number">100%</span>
            <span className="brand-badge-label">Online & Gratuito</span>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h1 className="login-title">
              {isRegister ? "Criar conta" : "Bem-vindo"}
            </h1>
            <p className="login-subtitle">
              {isRegister
                ? "Comece a receber agendamentos hoje"
                : "Acesse seu painel de agendamentos"}
            </p>

            {error && <div className="login-error">{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              {isRegister && (
                <>
                  <div className="input-group">
                    <label className="input-label">Nome completo</label>
                    <input
                      className="login-input"
                      type="text"
                      name="name"
                      placeholder="Seu nome"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Link personalizado</label>
                    <input
                      className="login-input"
                      type="text"
                      name="slug"
                      placeholder="ex: joao-fisioterapeuta"
                      value={form.slug}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}
              <div className="input-group">
                <label className="input-label">E-mail</label>
                <input
                  className="login-input"
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Senha</label>
                <input
                  className="login-input"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="login-btn" type="submit" disabled={loading}>
                {loading
                  ? "Carregando..."
                  : isRegister
                    ? "Criar minha conta"
                    : "Entrar"}
              </button>
            </form>

            <p className="login-toggle">
              {isRegister ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
              <span
                className="login-toggle-link"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Entrar" : "Criar agora"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
