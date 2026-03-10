import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function PublicBooking() {
  const { slug } = useParams(); // Pega o slug da URL: /agendar/joao-barbeiro

  const [professional, setProfessional] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ client_name: "", client_phone: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carrega dados do profissional ao abrir a página
  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const { data } = await api.get(`/api/appointments/public/${slug}`);
        setProfessional(data.user);
        setServices(data.services);
      } catch {
        alert("Profissional não encontrado");
      } finally {
        setLoading(false);
      }
    };
    fetchProfessional();
  }, [slug]);

  // Busca horários disponíveis quando o usuário escolhe uma data
  useEffect(() => {
    if (!selectedDate || !professional) return;

    const fetchSlots = async () => {
      const { data } = await api.get("/api/appointments/available", {
        params: { user_id: professional.id, date: selectedDate },
      });
      setAvailableSlots(data.available);
      setSelectedTime("");
    };
    fetchSlots();
  }, [selectedDate, professional]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/api/appointments", {
      user_id: professional.id,
      service_id: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      ...form,
    });

    setSuccess(true);
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>Carregando...</p>
    );

  if (success)
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>✅ Agendamento confirmado!</h1>
          <p>Seu horário foi reservado com sucesso.</p>
          <p>
            <strong>{selectedDate}</strong> às <strong>{selectedTime}</strong>
          </p>
          <p>
            Serviço: <strong>{selectedService?.name}</strong>
          </p>
        </div>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📅 {professional?.name}</h1>
        <p style={styles.subtitle}>Agende seu horário</p>

        {/* PASSO 1: Escolher serviço */}
        <h3 style={styles.step}>1. Escolha o serviço</h3>
        <div style={styles.serviceGrid}>
          {services.map((service) => (
            <div
              key={service.id}
              style={
                selectedService?.id === service.id
                  ? styles.serviceCardActive
                  : styles.serviceCard
              }
              onClick={() => setSelectedService(service)}
            >
              <strong>{service.name}</strong>
              <br />
              <small>⏱ {service.duration} min</small>
              <br />
              <span style={styles.price}>R$ {service.price}</span>
            </div>
          ))}
        </div>

        {/* PASSO 2: Escolher data */}
        {selectedService && (
          <>
            <h3 style={styles.step}>2. Escolha a data</h3>
            <input
              style={styles.input}
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </>
        )}

        {/* PASSO 3: Escolher horário */}
        {availableSlots.length > 0 && (
          <>
            <h3 style={styles.step}>3. Escolha o horário</h3>
            <div style={styles.slotsGrid}>
              {availableSlots.map((slot) => (
                <div
                  key={slot}
                  style={
                    selectedTime === slot ? styles.slotActive : styles.slot
                  }
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </div>
              ))}
            </div>
          </>
        )}

        {selectedDate && availableSlots.length === 0 && (
          <p style={styles.empty}>Nenhum horário disponível nesta data.</p>
        )}

        {/* PASSO 4: Dados do cliente */}
        {selectedTime && (
          <>
            <h3 style={styles.step}>4. Seus dados</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                style={styles.input}
                placeholder="Seu nome"
                value={form.client_name}
                onChange={(e) =>
                  setForm({ ...form, client_name: e.target.value })
                }
                required
              />
              <input
                style={styles.input}
                placeholder="Seu telefone"
                value={form.client_phone}
                onChange={(e) =>
                  setForm({ ...form, client_phone: e.target.value })
                }
                required
              />
              <button style={styles.button} type="submit">
                Confirmar agendamento
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "24px",
  },
  card: {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    margin: "0 auto",
  },
  title: { marginBottom: "4px" },
  subtitle: { color: "#666", marginBottom: "24px" },
  step: { marginTop: "24px", marginBottom: "12px", color: "#4F46E5" },
  serviceGrid: { display: "flex", gap: "12px", flexWrap: "wrap" },
  serviceCard: {
    border: "2px solid #ddd",
    borderRadius: "8px",
    padding: "12px 16px",
    cursor: "pointer",
    minWidth: "120px",
  },
  serviceCardActive: {
    border: "2px solid #4F46E5",
    borderRadius: "8px",
    padding: "12px 16px",
    cursor: "pointer",
    backgroundColor: "#EEF2FF",
    minWidth: "120px",
  },
  price: { color: "#4F46E5", fontWeight: "bold" },
  slotsGrid: { display: "flex", gap: "8px", flexWrap: "wrap" },
  slot: {
    border: "2px solid #ddd",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
  },
  slotActive: {
    border: "2px solid #4F46E5",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    backgroundColor: "#EEF2FF",
    color: "#4F46E5",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
    boxSizing: "border-box",
    marginBottom: "8px",
  },
  form: { display: "flex", flexDirection: "column", gap: "8px" },
  button: {
    padding: "12px",
    backgroundColor: "#4F46E5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  empty: { color: "#999", marginTop: "12px" },
};
