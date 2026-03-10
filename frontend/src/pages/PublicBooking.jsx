import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function PublicBooking() {
  const { slug } = useParams();
  const [professional, setProfessional] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ client_name: "", client_phone: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const { data } = await api.get(`/api/appointments/public/${slug}`);
        setProfessional(data.professional);
        setServices(data.services);
      } catch {
        setError("Profissional não encontrado.");
      }
    };
    fetchPublic();
  }, [slug]);

  const fetchSlots = async (date) => {
    if (!selectedService || !date) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const { data } = await api.get(
        `/api/appointments/available?user_id=${professional.id}&date=${date}`,
      );
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    fetchSlots(e.target.value);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedDate("");
    setSlots([]);
    setSelectedSlot(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/appointments", {
        user_id: professional.id,
        service_id: selectedService.id,
        date: selectedDate,
        time: selectedSlot,
        client_name: form.client_name,
        client_phone: form.client_phone,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao confirmar agendamento.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (error && !professional) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F7F2",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        <p style={{ color: "#DC2626", fontSize: "18px" }}>❌ {error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(145deg, #F0F9E8, #FAFDF6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "DM Sans, sans-serif",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "56px 48px",
              textAlign: "center",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 8px 48px rgba(74,140,28,0.15)",
              border: "1px solid #D4EEAA",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>✅</div>
            <h2
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "32px",
                color: "#1A3A05",
                marginBottom: "12px",
              }}
            >
              Agendamento confirmado!
            </h2>
            <p
              style={{
                color: "#5A7A3A",
                fontSize: "16px",
                lineHeight: 1.6,
                marginBottom: "32px",
              }}
            >
              Seu horário com <strong>{professional?.name}</strong> está
              reservado.
              <br />
              Até lá! 💪
            </p>
            <div
              style={{
                background: "#EEF7E0",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "32px",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "14px",
                  color: "#3A7A10",
                }}
              >
                🩺 <strong>Serviço:</strong> {selectedService?.name}
              </p>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "14px",
                  color: "#3A7A10",
                }}
              >
                📅 <strong>Data:</strong>{" "}
                {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                  "pt-BR",
                  { weekday: "long", day: "2-digit", month: "long" },
                )}
              </p>
              <p style={{ margin: "0", fontSize: "14px", color: "#3A7A10" }}>
                ⏰ <strong>Horário:</strong> {selectedSlot}
              </p>
            </div>
            <button
              onClick={() => {
                setSuccess(false);
                setSelectedService(null);
                setSelectedDate("");
                setSlots([]);
                setSelectedSlot(null);
                setForm({ client_name: "", client_phone: "" });
              }}
              style={{
                background: "linear-gradient(135deg, #4A8C1C, #7AC143)",
                color: "white",
                border: "none",
                padding: "14px 32px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Fazer outro agendamento
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .pb-root {
          min-height: 100vh;
          background: linear-gradient(145deg, #F0F9E8 0%, #FAFDF6 60%, #EEF7E0 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 40px 16px 80px;
        }

        .pb-card {
          max-width: 640px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 48px rgba(74,140,28,0.12);
          border: 1px solid #E0F0C8;
        }

        .pb-hero {
          background: linear-gradient(135deg, #3A7A10 0%, #7AC143 100%);
          padding: 36px 40px;
          position: relative;
          overflow: hidden;
        }

        .pb-hero::before {
          content: '';
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          top: -80px;
          right: -60px;
        }

        .pb-hero-icon {
          width: 64px;
          height: 64px;
          background: rgba(255,255,255,0.2);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .pb-hero-name {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          color: white;
          margin-bottom: 6px;
          position: relative;
          z-index: 1;
        }

        .pb-hero-sub {
          color: rgba(255,255,255,0.8);
          font-size: 15px;
          font-weight: 300;
          position: relative;
          z-index: 1;
        }

        .pb-body {
          padding: 36px 40px;
        }

        .pb-step {
          margin-bottom: 36px;
        }

        .pb-step-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .pb-step-num {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #4A8C1C, #7AC143);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .pb-step-title {
          font-size: 16px;
          font-weight: 600;
          color: #1A3A05;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
        }

        .service-btn {
          border: 2px solid #E0EDD0;
          background: #FAFDF6;
          border-radius: 14px;
          padding: 18px 16px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .service-btn:hover {
          border-color: #7AC143;
          background: #F0F9E8;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(74,140,28,0.15);
        }

        .service-btn.selected {
          border-color: #4A8C1C;
          background: #EEF7E0;
          box-shadow: 0 4px 16px rgba(74,140,28,0.2);
        }

        .service-btn-name {
          font-size: 15px;
          font-weight: 600;
          color: #1A3A05;
          margin-bottom: 6px;
        }

        .service-btn-meta {
          font-size: 12px;
          color: #7A8A6A;
          margin-bottom: 4px;
        }

        .service-btn-price {
          font-size: 16px;
          font-weight: 700;
          color: #3A7A10;
        }

        .pb-date-input {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid #D4E4C0;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #1A3A05;
          background: #FAFDF6;
          outline: none;
          transition: all 0.2s;
        }

        .pb-date-input:focus {
          border-color: #7AC143;
          box-shadow: 0 0 0 4px rgba(122,193,67,0.1);
          background: white;
        }

        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 10px;
        }

        .slot-btn {
          padding: 11px 8px;
          border: 1.5px solid #D4E4C0;
          background: #FAFDF6;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #3A5A1A;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .slot-btn:hover {
          border-color: #7AC143;
          background: #F0F9E8;
          transform: translateY(-1px);
        }

        .slot-btn.selected {
          background: linear-gradient(135deg, #4A8C1C, #7AC143);
          border-color: transparent;
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(74,140,28,0.3);
        }

        .pb-input {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid #D4E4C0;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #1A3A05;
          background: #FAFDF6;
          outline: none;
          transition: all 0.2s;
          margin-bottom: 12px;
        }

        .pb-input:focus {
          border-color: #7AC143;
          box-shadow: 0 0 0 4px rgba(122,193,67,0.1);
          background: white;
        }

        .pb-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #3A7A10, #7AC143);
          color: white;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }

        .pb-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(74,140,28,0.35);
        }

        .pb-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .pb-error {
          background: #FEE2E2;
          color: #DC2626;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 16px;
          border-left: 3px solid #DC2626;
        }

        .slots-loading {
          color: #7A8A6A;
          font-size: 14px;
          padding: 16px 0;
          text-align: center;
        }

        .divider {
          border: none;
          border-top: 1px solid #E8F5D8;
          margin: 0 0 36px;
        }

        @media (max-width: 600px) {
          .pb-hero, .pb-body { padding: 28px 24px; }
          .pb-hero-name { font-size: 24px; }
        }
      `}</style>

      <div className="pb-root">
        <div className="pb-card">
          {/* HERO */}
          <div className="pb-hero">
            <div className="pb-hero-icon">🩺</div>
            <h1 className="pb-hero-name">{professional?.name || "..."}</h1>
            <p className="pb-hero-sub">
              Agende sua consulta online • Rápido e fácil
            </p>
          </div>

          <div className="pb-body">
            {error && <div className="pb-error">{error}</div>}

            {/* STEP 1: SERVIÇO */}
            <div className="pb-step">
              <div className="pb-step-label">
                <div className="pb-step-num">1</div>
                <span className="pb-step-title">Escolha o serviço</span>
              </div>
              <div className="services-grid">
                {services.map((s) => (
                  <button
                    key={s.id}
                    className={`service-btn ${selectedService?.id === s.id ? "selected" : ""}`}
                    onClick={() => handleServiceSelect(s)}
                    type="button"
                  >
                    <div className="service-btn-name">{s.name}</div>
                    <div className="service-btn-meta">⏱ {s.duration} min</div>
                    <div className="service-btn-price">R$ {s.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedService && (
              <>
                <hr className="divider" />
                {/* STEP 2: DATA */}
                <div className="pb-step">
                  <div className="pb-step-label">
                    <div className="pb-step-num">2</div>
                    <span className="pb-step-title">Escolha a data</span>
                  </div>
                  <input
                    type="date"
                    className="pb-date-input"
                    value={selectedDate}
                    min={today}
                    onChange={handleDateChange}
                  />
                </div>
              </>
            )}

            {selectedDate && (
              <>
                <hr className="divider" />
                {/* STEP 3: HORÁRIO */}
                <div className="pb-step">
                  <div className="pb-step-label">
                    <div className="pb-step-num">3</div>
                    <span className="pb-step-title">Escolha o horário</span>
                  </div>
                  {loadingSlots ? (
                    <p className="slots-loading">
                      Carregando horários disponíveis...
                    </p>
                  ) : slots.length === 0 ? (
                    <p className="slots-loading">
                      Nenhum horário disponível para esta data.
                    </p>
                  ) : (
                    <div className="slots-grid">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          className={`slot-btn ${selectedSlot === slot ? "selected" : ""}`}
                          onClick={() => setSelectedSlot(slot)}
                          type="button"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedSlot && (
              <>
                <hr className="divider" />
                {/* STEP 4: DADOS */}
                <div className="pb-step">
                  <div className="pb-step-label">
                    <div className="pb-step-num">4</div>
                    <span className="pb-step-title">Seus dados</span>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <input
                      className="pb-input"
                      placeholder="Seu nome completo"
                      value={form.client_name}
                      onChange={(e) =>
                        setForm({ ...form, client_name: e.target.value })
                      }
                      required
                    />
                    <input
                      className="pb-input"
                      placeholder="Seu telefone / WhatsApp"
                      value={form.client_phone}
                      onChange={(e) =>
                        setForm({ ...form, client_phone: e.target.value })
                      }
                      required
                    />
                    <button
                      className="pb-submit"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Confirmando..." : "✅ Confirmar agendamento"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
