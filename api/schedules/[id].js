import supabase from "../_supabase.js";
import { verifyToken } from "../_auth-middleware.js";

export default async function handler(req, res) {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: "Não autorizado" });

  const { id } = req.query;

  if (req.method === "DELETE") {
    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: "Horário removido com sucesso!" });
  }

  res.status(405).json({ error: "Método não permitido" });
}
