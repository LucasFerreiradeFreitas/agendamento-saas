import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.js";
import servicesRoutes from "./routes/services.js";
import schedulesRoutes from "./routes/schedules.js";
import appointmentsRoutes from "./routes/appointments.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/appointments", appointmentsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API funcionando! 🚀" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
