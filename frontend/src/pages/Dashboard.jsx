import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("agenda");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [newService, setNewService] = useState({
    name: "",
    duration: "",
    price: "",
  });
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: "segunda",
    start_time: "09:00",
    end_time: "18:00",
  });

  useEffect(() => {
    fetchServices();
    fetchSchedules();
    fetchAppointments(selectedDate);
  }, []);

  const fetchServices = async () => {
    const { data } = await api.get("/api/services");
    setServices(data);
  };

  const fetchSchedules = async () => {
    const { data } = await api.get("/api/schedules");
    setSchedules(data);
  };

  const fetchAppointments = async (date) => {
    const { data } = await api.get(`/api/appointments?date=${date}`);
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

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    await api.post("/api/schedules", newSchedule);
    fetchSchedules();
  };

  const handleDeleteSchedule = async (id) => {
    await api.delete(`/api/schedules/${id}`);
    fetchSchedules();
  };

  const handleCancelAppointment = async (id) => {
    await api.put(`/api/appointments/${id}/cancel`);
    fetchAppointments(selectedDate);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dayLabel = (d) => {
    const map = {
      segunda: "Segunda-feira",
      terca: "Terça-feira",
      quarta: "Quarta-feira",
      quinta: "Quinta-feira",
      sexta: "Sexta-feira",
      sabado: "Sábado",
      domingo: "Domingo",
    };
    return map[d] || d;
  };

  const tabs = [
    { key: "agenda", icon: "📋", label: "Agenda" },
    { key: "services", icon: "🩺", label: "Serviços" },
    { key: "schedules", icon: "🕐", label: "Horários" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #F5F7F2; }

        .dash-header {
          background: linear-gradient(135deg, #3A7A10 0%, #7AC143 100%);
          padding: 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 64px;
          box-shadow: 0 2px 16px rgba(74,140,28,0.25);
        }

        .dash-brand {
          font-family: 'Playfair Display', serif;
          color: white;
          font-size: 22px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dash-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .dash-user {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
          font-weight: 500;
        }

        .dash-logout {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 7px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          transition: all 0.2s;
        }

        .dash-logout:hover { background: rgba(255,255,255,0.25); }

        .dash-link-bar {
          background: white;
          padding: 12px 32px;
          border-bottom: 1px solid #E0EDD0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #5A7A3A;
        }

        .dash-link-bar strong {
          color: #3A7A10;
          font-weight: 600;
        }

        .dash-link-copy {
          margin-left: auto;
          background: #EEF7E0;
          border: 1px solid #C4E09A;
          color: #3A7A10;
          padding: 5px 14px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .dash-link-copy:hover { background: #D4EEAA; }

        .dash-tabs {
          background: white;
          border-bottom: 1px solid #E0EDD0;
          display: flex;
          padding: 0 32px;
          gap: 4px;
        }

        .dash-tab {
          padding: 14px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #7A8A6A;
          font-weight: 500;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .dash-tab:hover { color: #4A8C1C; }

        .dash-tab.active {
          color: #3A7A10;
          border-bottom-color: #7AC143;
          font-weight: 600;
        }

        .dash-content {
          max-width: 760px;
          margin: 32px auto;
          padding: 0 24px;
        }

        .dash-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .dash-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: #1A3A05;
        }

        .dash-date-input {
          padding: 9px 14px;
          border: 1.5px solid #D4E4C0;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #3A5A1A;
          background: white;
          outline: none;
          cursor: pointer;
          transition: border 0.2s;
        }

        .dash-date-input:focus { border-color: #7AC143; }

        .apt-card {
          background: white;
          border-radius: 14px;
          padding: 20px 24px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 8px rgba(74,140,28,0.08);
          border: 1px solid #E8F5D8;
          transition: box-shadow 0.2s;
        }

        .apt-card:hover { box-shadow: 0 4px 16px rgba(74,140,28,0.14); }

        .apt-time {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #3A7A10;
          margin-right: 20px;
          min-width: 60px;
        }

        .apt-info { flex: 1; }

        .apt-name {
          font-size: 16px;
          font-weight: 600;
          color: #1A3A05;
          margin-bottom: 4px;
        }

        .apt-details {
          font-size: 13px;
          color: #7A8A6A;
          display: flex;
          gap: 12px;
        }

        .apt-service-tag {
          background: #EEF7E0;
          color: #3A7A10;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .apt-cancel-btn {
          background: #FEE2E2;
          color: #DC2626;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .apt-cancel-btn:hover { background: #FECACA; }

        .apt-cancelled {
          font-size: 13px;
          color: #DC2626;
          background: #FEE2E2;
          padding: 6px 12px;
          border-radius: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #9AAA8A;
        }

        .empty-state-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state-text { font-size: 15px; }

        .form-card {
          background: white;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 8px rgba(74,140,28,0.08);
          border: 1px solid #E8F5D8;
        }

        .form-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .form-input {
          flex: 1;
          min-width: 130px;
          padding: 12px 16px;
          border: 1.5px solid #D4E4C0;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1A3A05;
          background: #FAFDF6;
          outline: none;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: #7AC143;
          box-shadow: 0 0 0 3px rgba(122,193,67,0.1);
          background: white;
        }

        .form-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #4A8C1C, #7AC143);
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .form-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(74,140,28,0.3);
        }

        .service-card {
          background: white;
          border-radius: 14px;
          padding: 18px 24px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 6px rgba(74,140,28,0.07);
          border: 1px solid #E8F5D8;
        }

        .service-name {
          font-size: 16px;
          font-weight: 600;
          color: #1A3A05;
          margin-bottom: 4px;
        }

        .service-meta {
          font-size: 13px;
          color: #7A8A6A;
          display: flex;
          gap: 12px;
        }

        .service-price {
          color: #3A7A10;
          font-weight: 600;
        }

        .remove-btn {
          background: #FEE2E2;
          color: #DC2626;
          border: none;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          transition: all 0.2s;
        }

        .remove-btn:hover { background: #FECACA; }
      `}</style>

      <div>
        {/* HEADER */}
        <header className="dash-header">
          <div className="dash-brand">📅 AgendaPro</div>
          <div className="dash-header-right">
            <span className="dash-user">Olá, {user?.name}</span>
            <button className="dash-logout" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>

        {/* LINK BAR */}
        <div className="dash-link-bar">
          🔗 Seu link:{" "}
          <strong>
            {window.location.origin}/agendar/{user?.slug}
          </strong>
          <button
            className="dash-link-copy"
            onClick={() =>
              navigator.clipboard.writeText(
                `${window.location.origin}/agendar/${user?.slug}`,
              )
            }
          >
            Copiar link
          </button>
        </div>

        {/* TABS */}
        <div className="dash-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`dash-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ABA: AGENDA */}
        {activeTab === "agenda" && (
          <div className="dash-content">
            <div className="dash-section-header">
              <h2 className="dash-section-title">Agendamentos</h2>
              <input
                type="date"
                className="dash-date-input"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  fetchAppointments(e.target.value);
                }}
              />
            </div>

            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p className="empty-state-text">
                  Nenhum agendamento para esta data.
                </p>
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="apt-card">
                  <span className="apt-time">{apt.time?.slice(0, 5)}</span>
                  <div className="apt-info">
                    <div className="apt-name">{apt.client_name}</div>
                    <div className="apt-details">
                      <span className="apt-service-tag">
                        {apt.services?.name}
                      </span>
                      <span>R$ {apt.services?.price}</span>
                      <span>📞 {apt.client_phone}</span>
                    </div>
                  </div>
                  {apt.status === "confirmed" && (
                    <button
                      className="apt-cancel-btn"
                      onClick={() => handleCancelAppointment(apt.id)}
                    >
                      Cancelar
                    </button>
                  )}
                  {apt.status === "cancelled" && (
                    <span className="apt-cancelled">Cancelado</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ABA: SERVIÇOS */}
        {activeTab === "services" && (
          <div className="dash-content">
            <div className="dash-section-header">
              <h2 className="dash-section-title">Meus Serviços</h2>
            </div>

            <div className="form-card">
              <form onSubmit={handleCreateService}>
                <div className="form-row">
                  <input
                    className="form-input"
                    placeholder="Nome do serviço"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    required
                  />
                  <input
                    className="form-input"
                    placeholder="Duração (min)"
                    type="number"
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({ ...newService, duration: e.target.value })
                    }
                    required
                  />
                  <input
                    className="form-input"
                    placeholder="Preço (R$)"
                    type="number"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: e.target.value })
                    }
                    required
                  />
                  <button className="form-btn" type="submit">
                    + Adicionar
                  </button>
                </div>
              </form>
            </div>

            {services.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🩺</div>
                <p className="empty-state-text">
                  Nenhum serviço cadastrado ainda.
                </p>
              </div>
            ) : (
              services.map((s) => (
                <div key={s.id} className="service-card">
                  <div>
                    <div className="service-name">{s.name}</div>
                    <div className="service-meta">
                      <span>⏱ {s.duration} min</span>
                      <span className="service-price">R$ {s.price}</span>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleDeleteService(s.id)}
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ABA: HORÁRIOS */}
        {activeTab === "schedules" && (
          <div className="dash-content">
            <div className="dash-section-header">
              <h2 className="dash-section-title">Horários de Atendimento</h2>
            </div>

            <div className="form-card">
              <form onSubmit={handleCreateSchedule}>
                <div className="form-row">
                  <select
                    className="form-input"
                    value={newSchedule.day_of_week}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        day_of_week: e.target.value,
                      })
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
                    className="form-input"
                    type="time"
                    value={newSchedule.start_time}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        start_time: e.target.value,
                      })
                    }
                  />
                  <input
                    className="form-input"
                    type="time"
                    value={newSchedule.end_time}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        end_time: e.target.value,
                      })
                    }
                  />
                  <button className="form-btn" type="submit">
                    + Adicionar
                  </button>
                </div>
              </form>
            </div>

            {schedules.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🕐</div>
                <p className="empty-state-text">
                  Nenhum horário cadastrado ainda.
                </p>
              </div>
            ) : (
              schedules.map((s) => (
                <div key={s.id} className="service-card">
                  <div>
                    <div className="service-name">
                      {dayLabel(s.day_of_week)}
                    </div>
                    <div className="service-meta">
                      <span>
                        ⏰ {s.start_time.slice(0, 5)} até{" "}
                        {s.end_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleDeleteSchedule(s.id)}
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
