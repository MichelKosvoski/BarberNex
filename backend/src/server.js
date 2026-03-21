const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./config/db");

// rotas
const barbeariaRoutes = require("./routes/barbearia.routes");
const agendamentoRoutes = require("./routes/agendamentos.routes");

app.use(cors());
app.use(express.json());

// testar banco
async function testarBanco() {
  try {
    await db.query("SELECT 1");
    console.log("✅ Banco MySQL conectado");
  } catch (error) {
    console.error("❌ Erro ao conectar no banco:", error);
  }
}

testarBanco();

// rotas
app.use("/api/barbearias", barbeariaRoutes);
app.use("/api/agendamentos", agendamentoRoutes);

// rota teste
app.get("/", (req, res) => {
  res.send("API NexBarber rodando 🚀");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
