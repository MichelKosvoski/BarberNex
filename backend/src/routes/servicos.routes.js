const express = require("express");
const controller = require("../controllers/servicos.controller");

const router = express.Router();

router.get("/barbearia/:barbeariaId", controller.listarServicos);
router.post("/barbearia/:barbeariaId", controller.criarServico);
router.put("/:id", controller.atualizarServico);
router.delete("/:id", controller.removerServico);

module.exports = router;
