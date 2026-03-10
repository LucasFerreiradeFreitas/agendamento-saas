import express from "express";
import supabase from "../supabase.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/public/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name")
      .eq("slug", slug)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "Profissional não encontrado" });
    }

    const { data: services } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", user.id);

    const { data: schedules } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", user.id);

    res.json({ user, services, schedules });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/available", async (req, res) => {
  try {
    const { user_id, date } = req.query;

    if (!user_id || !date) {
      return res.status(400).json({ error: "user_id e date são obrigatórios" });
    }

    const dayNames = [
      "domingo",
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
    ];
    const dayOfWeek = dayNames[new Date(date + "T12:00:00").getDay()];

    const { data: schedule } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", user_id)
      .eq("day_of_week", dayOfWeek)
      .single();

    if (!schedule) {
      return res.json({ available: [] });
    }

    const slots = generateTimeSlots(schedule.start_time, schedule.end_time, 30);

    const { data: appointments } = await supabase
      .from("appointments")
      .select("time")
      .eq("user_id", user_id)
      .eq("date", date)
      .eq("status", "confirmed");

    const occupiedTimes = appointments.map((a) => a.time.slice(0, 5));

    const available = slots.filter((slot) => !occupiedTimes.includes(slot));

    res.json({ available });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

function generateTimeSlots(start, end, intervalMinutes) {
  const slots = [];

  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let current = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  while (current < endTotal) {
    const hours = Math.floor(current / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (current % 60).toString().padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    current += intervalMinutes;
  }

  return slots;
}

router.post("/", async (req, res) => {
  try {
    const { user_id, service_id, date, time, client_name, client_phone } =
      req.body;

    if (
      !user_id ||
      !service_id ||
      !date ||
      !time ||
      !client_name ||
      !client_phone
    ) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("user_id", user_id)
      .eq("date", date)
      .eq("time", time)
      .eq("status", "confirmed")
      .single();

    if (existing) {
      return res.status(400).json({ error: "Esse horário já está ocupado" });
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([{ user_id, service_id, date, time, client_name, client_phone }])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({
      message: "Agendamento confirmado!",
      appointment: data[0],
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;

    let query = supabase
      .from("appointments")
      .select(
        `
        *,
        services (name, duration, price)
      `,
      )
      .eq("user_id", req.user.id)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (date) {
      query = query.eq("date", date);
    }

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Agendamento cancelado!", appointment: data[0] });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
