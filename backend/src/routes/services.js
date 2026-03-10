import express from "express";
import supabase from "../supabase.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, duration, price } = req.body;

    if (!name || !duration || !price) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          user_id: req.user.id,
          name,
          duration,
          price,
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, price } = req.body;

    const { data, error } = await supabase
      .from("services")
      .update({ name, duration, price })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Serviço removido com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
