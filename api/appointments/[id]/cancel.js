import supabase from "../_supabase.js";
import { verifyToken } from "../../_auth-middleware.js";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: "Não autorizado" });

  const { id } = req.query;

  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Agendamento cancelado!", appointment: data[0] });
}
