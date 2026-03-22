const express = require("express");
const controller = require("../controllers/barbeiros.controller");

const router = express.Router();

router.get("/barbearia/:barbeariaId", controller.listarBarbeiros);
router.post("/barbearia/:barbeariaId", controller.criarBarbeiro);
router.put("/:id", controller.atualizarBarbeiro);
router.delete("/:id", controller.removerBarbeiro);

module.exports = router;
