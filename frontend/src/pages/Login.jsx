import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  // Atualiza o campo do formulário que foi alterado
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do form (recarregar a página)
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const { data } = await api.post(endpoint, form);

      // Salva o token e redireciona para o dashboard
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Algo deu errado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📅 Agendamento SaaS</h1>
        <h2 style={styles.subtitle}>{isRegister ? "Criar conta" : "Entrar"}</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <>
              <input
                style={styles.input}
                type="text"
                name="name"
                placeholder="Seu nome"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                style={styles.input}
                type="text"
                name="slug"
                placeholder="Seu link (ex: joao-barbeiro)"
                value={form.slug}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Carregando..." : isRegister ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <p style={styles.toggle}>
          {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
          <span style={styles.link} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Entrar" : "Criar conta"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: { textAlign: "center", marginBottom: "8px", fontSize: "24px" },
  subtitle: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#666",
    fontWeight: "normal",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    padding: "12px",
    backgroundColor: "#4F46E5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "8px",
  },
  error: { color: "red", textAlign: "center", marginBottom: "12px" },
  toggle: { textAlign: "center", marginTop: "16px", color: "#666" },
  link: { color: "#4F46E5", cursor: "pointer", fontWeight: "bold" },
};
