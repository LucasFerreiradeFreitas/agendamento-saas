import supabase from "../../_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { slug } = req.query;

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
}
