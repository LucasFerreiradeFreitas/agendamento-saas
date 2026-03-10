import express from "express";
import supabase from "../supabase.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { day_of_week, start_time, end_time } = req.body;

    if (!day_of_week || !start_time || !end_time) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const { data, error } = await supabase
      .from("schedules")
      .insert([
        {
          user_id: req.user.id,
          day_of_week,
          start_time,
          end_time,
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Horário removido com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
