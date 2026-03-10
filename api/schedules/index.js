import supabase from "../_supabase.js";
import { verifyToken } from "../_auth-middleware.js";

export default async function handler(req, res) {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: "Não autorizado" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", user.id);

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === "POST") {
    const { day_of_week, start_time, end_time } = req.body;

    if (!day_of_week || !start_time || !end_time) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const { data, error } = await supabase
      .from("schedules")
      .insert([{ user_id: user.id, day_of_week, start_time, end_time }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  res.status(405).json({ error: "Método não permitido" });
}
