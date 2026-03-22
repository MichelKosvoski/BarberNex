const express = require("express");
const controller = require("../controllers/despesas.controller");

const router = express.Router();

router.get("/barbearia/:barbeariaId", controller.listarDespesas);
router.post("/barbearia/:barbeariaId", controller.criarDespesa);
router.delete("/:id", controller.removerDespesa);

module.exports = router;
