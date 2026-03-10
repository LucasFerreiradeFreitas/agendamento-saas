import supabase from "../_supabase.js";
import { verifyToken } from "../_auth-middleware.js";

export default async function handler(req, res) {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: "Não autorizado" });

  const { id } = req.query;

  // PUT — edita
  if (req.method === "PUT") {
    const { name, duration, price } = req.body;

    const { data, error } = await supabase
      .from("services")
      .update({ name, duration, price })
      .eq("id", id)
      .eq("user_id", user.id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data[0]);
  }

  // DELETE — remove
  if (req.method === "DELETE") {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: "Serviço removido com sucesso!" });
  }

  res.status(405).json({ error: "Método não permitido" });
}
