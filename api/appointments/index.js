import supabase from "../_supabase.js";
import { verifyToken } from "../_auth-middleware.js";

export default async function handler(req, res) {
  // POST — cliente cria agendamento (público)
  if (req.method === "POST") {
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
    return res
      .status(201)
      .json({ message: "Agendamento confirmado!", appointment: data[0] });
  }

  // GET — profissional vê agenda (privado)
  if (req.method === "GET") {
    const user = verifyToken(req);
    if (!user) return res.status(401).json({ error: "Não autorizado" });

    const { date } = req.query;

    let query = supabase
      .from("appointments")
      .select("*, services (name, duration, price)")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (date) query = query.eq("date", date);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  }

  res.status(405).json({ error: "Método não permitido" });
}
