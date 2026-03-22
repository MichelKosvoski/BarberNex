const express = require("express");
const controller = require("../controllers/clientes.controller");

const router = express.Router();

router.get("/barbearia/:barbeariaId", controller.listarClientes);
router.post("/barbearia/:barbeariaId", controller.criarCliente);
router.put("/:id", controller.atualizarCliente);
router.delete("/:id", controller.removerCliente);

module.exports = router;
