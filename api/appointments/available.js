import supabase from "../_supabase.js";

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

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

  if (!schedule) return res.json({ available: [] });

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
}
