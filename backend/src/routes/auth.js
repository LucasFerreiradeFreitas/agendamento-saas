import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../supabase.js";
import "dotenv/config";

const router = express.Router();

router.post("/register", async (req, res) => {
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

    if (error) {
      return res.status(400).json({ error: error.message });
    }

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
});

router.post("/login", async (req, res) => {
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
});

export default router;
