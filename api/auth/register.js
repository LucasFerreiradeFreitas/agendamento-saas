import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../_supabase.js";

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { name, email, password, slug } = req.body;

    if (!name || !email || !password || !slug) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password: hashedPassword, slug }])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    const token = jwt.sign(
      { id: data[0].id, email: data[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      token,
      user: {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        slug: data[0].slug,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
