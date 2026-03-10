import supabase from "../_supabase.js";
import { verifyToken } from "../_auth-middleware.js";

export default async function handler(req, res) {
  const user = verifyToken(req);

  if (!user) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  // GET — lista serviços
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  }

  // POST — cria serviço
  if (req.method === "POST") {
    const { name, duration, price } = req.body;

    if (!name || !duration || !price) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const { data, error } = await supabase
      .from("services")
      .insert([{ user_id: user.id, name, duration, price }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  res.status(405).json({ error: "Método não permitido" });
}
