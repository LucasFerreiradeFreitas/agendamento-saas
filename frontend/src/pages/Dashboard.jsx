import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("agenda");

  const [newService, setNewService] = useState({
    name: "",
    duration: "",
    price: "",
  });

  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: "segunda",
    start_time: "09:00",
    end_time: "18:00",
  });

  useEffect(() => {
    fetchServices();
    fetchAppointments();
    fetchSchedules();
  }, []);

  const fetchServices = async () => {
    const { data } = await api.get("/api/services");
    setServices(data);
  };

  const fetchSchedules = async () => {
    const { data } = await api.get("/api/schedules");
    setSchedules(data);
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    await api.post("/api/schedules", newSchedule);
    fetchSchedules();
  };

  const handleDeleteSchedule = async (id) => {
    await api.delete(`/api/schedules/${id}`);
    fetchSchedules();
  };

  const fetchAppointments = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await api.get(`/api/appointments?date=${today}`);
    setAppointments(data);
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    await api.post("/api/services", newService);
    setNewService({ name: "", duration: "", price: "" });
    fetchServices();
  };

  const handleDeleteService = async (id) => {
    await api.delete(`/api/services/${id}`);
    fetchServices();
  };

  const handleCancelAppointment = async (id) => {
    await api.put(`/api/appointments/${id}/cancel`);
    fetchAppointments();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>📅 Agendamento SaaS</h1>
        <div style={styles.headerRight}>
          <span style={styles.headerUser}>Olá, {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      {/* LINK PÚBLICO */}
      <div style={styles.linkBox}>
        <span>🔗 Seu link de agendamento: </span>
        <strong>
          {window.location.origin}/agendar/{user?.slug || "seu-slug"}
        </strong>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <button
          style={activeTab === "agenda" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("agenda")}
        >
          📋 Agenda de Hoje
        </button>
        <button
          style={activeTab === "services" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("services")}
        >
          ✂️ Meus Serviços
        </button>
        <button
          style={activeTab === "schedules" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("schedules")}
        >
          🕐 Meus Horários
        </button>
      </div>

      {/* ABA: AGENDA */}
      {activeTab === "agenda" && (
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>Agendamentos de Hoje</h2>
          {appointments.length === 0 ? (
            <p style={styles.empty}>Nenhum agendamento para hoje.</p>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} style={styles.card}>
                <div>
                  <strong>{apt.time?.slice(0, 5)}</strong> — {apt.client_name}
                  <br />
                  <small>
                    {apt.services?.name} • R$ {apt.services?.price}
                  </small>
                  <br />
                  <small>📞 {apt.client_phone}</small>
                </div>
                {apt.status === "confirmed" && (
                  <button
                    style={styles.cancelBtn}
                    onClick={() => handleCancelAppointment(apt.id)}
                  >
                    Cancelar
                  </button>
                )}
                {apt.status === "cancelled" && (
                  <span style={styles.cancelled}>Cancelado</span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ABA: SERVIÇOS */}
      {activeTab === "services" && (
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>Meus Serviços</h2>

          {/* Formulário para criar serviço */}
          <form onSubmit={handleCreateService} style={styles.serviceForm}>
            <input
              style={styles.input}
              placeholder="Nome do serviço"
              value={newService.name}
              onChange={(e) =>
                setNewService({ ...newService, name: e.target.value })
              }
              required
            />
            <input
              style={styles.input}
              placeholder="Duração (min)"
              type="number"
              value={newService.duration}
              onChange={(e) =>
                setNewService({ ...newService, duration: e.target.value })
              }
              required
            />
            <input
              style={styles.input}
              placeholder="Preço (R$)"
              type="number"
              step="0.01"
              value={newService.price}
              onChange={(e) =>
                setNewService({ ...newService, price: e.target.value })
              }
              required
            />
            <button style={styles.button} type="submit">
              + Adicionar
            </button>
          </form>

          {/* Lista de serviços */}
          {services.map((service) => (
            <div key={service.id} style={styles.card}>
              <div>
                <strong>{service.name}</strong>
                <br />
                <small>
                  ⏱ {service.duration} min • R$ {service.price}
                </small>
              </div>
              <button
                style={styles.cancelBtn}
                onClick={() => handleDeleteService(service.id)}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ABA: HORÁRIOS */}
      {activeTab === "schedules" && (
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>Meus Horários de Funcionamento</h2>

          {/* Formulário para criar horário */}
          <form onSubmit={handleCreateSchedule} style={styles.serviceForm}>
            <select
              style={styles.input}
              value={newSchedule.day_of_week}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, day_of_week: e.target.value })
              }
            >
              <option value="segunda">Segunda-feira</option>
              <option value="terca">Terça-feira</option>
              <option value="quarta">Quarta-feira</option>
              <option value="quinta">Quinta-feira</option>
              <option value="sexta">Sexta-feira</option>
              <option value="sabado">Sábado</option>
              <option value="domingo">Domingo</option>
            </select>

            <input
              style={styles.input}
              type="time"
              value={newSchedule.start_time}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, start_time: e.target.value })
              }
            />

            <input
              style={styles.input}
              type="time"
              value={newSchedule.end_time}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, end_time: e.target.value })
              }
            />

            <button style={styles.button} type="submit">
              + Adicionar
            </button>
          </form>

          {/* Lista de horários */}
          {schedules.length === 0 ? (
            <p style={styles.empty}>Nenhum horário cadastrado.</p>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} style={styles.card}>
                <div>
                  <strong style={{ textTransform: "capitalize" }}>
                    {schedule.day_of_week === "terca"
                      ? "Terça-feira"
                      : schedule.day_of_week === "sabado"
                        ? "Sábado"
                        : schedule.day_of_week.charAt(0).toUpperCase() +
                          schedule.day_of_week.slice(1) +
                          "-feira"}
                  </strong>
                  <br />
                  <small>
                    ⏰ {schedule.start_time.slice(0, 5)} até{" "}
                    {schedule.end_time.slice(0, 5)}
                  </small>
                </div>
                <button
                  style={styles.cancelBtn}
                  onClick={() => handleDeleteSchedule(schedule.id)}
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#4F46E5",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "white", margin: 0, fontSize: "20px" },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  headerUser: { color: "white" },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid white",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  linkBox: {
    backgroundColor: "#EEF2FF",
    padding: "12px 24px",
    borderBottom: "1px solid #C7D2FE",
  },
  tabs: {
    display: "flex",
    gap: "0",
    borderBottom: "2px solid #ddd",
    backgroundColor: "white",
  },
  tab: {
    padding: "14px 24px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "15px",
    color: "#666",
  },
  tabActive: {
    padding: "14px 24px",
    border: "none",
    borderBottom: "2px solid #4F46E5",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "15px",
    color: "#4F46E5",
    fontWeight: "bold",
    marginBottom: "-2px",
  },
  content: { padding: "24px", maxWidth: "700px", margin: "0 auto" },
  sectionTitle: { marginBottom: "16px" },
  card: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  cancelled: { color: "#DC2626", fontSize: "14px" },
  empty: { color: "#999", textAlign: "center", marginTop: "40px" },
  serviceForm: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    flex: 1,
    minWidth: "120px",
  },
  button: {
    padding: "10px 16px",
    backgroundColor: "#4F46E5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
