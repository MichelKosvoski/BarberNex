const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./config/db");
const ensureSchema = require("./utils/ensureSchema");

const barbeariaRoutes = require("./routes/barbearia.routes");
const agendamentoRoutes = require("./routes/agendamentos.routes");
const barbeirosRoutes = require("./routes/barbeiros.routes");
const servicosRoutes = require("./routes/servicos.routes");
const clientesRoutes = require("./routes/clientes.routes");
const produtosRoutes = require("./routes/produtos.routes");
const painelRoutes = require("./routes/painel.routes");
const authRoutes = require("./routes/auth.routes");
const assinaturasRoutes = require("./routes/assinaturas.routes");
const pdvRoutes = require("./routes/pdv.routes");
const despesasRoutes = require("./routes/despesas.routes");

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

async function testarBanco() {
  try {
    await db.query("SELECT 1");
    await ensureSchema();
    console.log("Banco MySQL conectado");
  } catch (error) {
    console.error("Erro ao conectar no banco:", error);
  }
}

testarBanco();

app.use("/api/barbearias", barbeariaRoutes);
app.use("/api/agendamentos", agendamentoRoutes);
app.use("/api/barbeiros", barbeirosRoutes);
app.use("/api/servicos", servicosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/painel", painelRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/assinaturas", assinaturasRoutes);
app.use("/api/pdv", pdvRoutes);
app.use("/api/despesas", despesasRoutes);

app.get("/", (req, res) => {
  res.send("API NexBarber rodando");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
