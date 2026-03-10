import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const passwordMatch = await bcrypt.compare(password, data.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const token = jwt.sign(
      { id: data.id, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        slug: data.slug,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
