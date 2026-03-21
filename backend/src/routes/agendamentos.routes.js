const express = require("express");
const router = express.Router();

const controller = require("../controllers/agendamentos.controller");

// Criar agendamento
router.post("/", controller.criarAgendamento);

// Listar agendamentos da barbearia
router.get("/barbearia/:id", controller.listarAgendamentos);

module.exports = router;
