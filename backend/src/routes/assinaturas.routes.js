const express = require("express");
const controller = require("../controllers/assinaturas.controller");

const router = express.Router();

router.get("/barbearia/:barbeariaId/planos", controller.listarPlanos);
router.post("/barbearia/:barbeariaId/planos", controller.criarPlano);
router.put("/planos/:id", controller.atualizarPlano);
router.delete("/planos/:id", controller.removerPlano);

router.get("/barbearia/:barbeariaId/clientes", controller.listarAssinaturasClientes);
router.post("/barbearia/:barbeariaId/clientes", controller.criarAssinaturaCliente);
router.put("/clientes/:id", controller.atualizarAssinaturaCliente);

module.exports = router;
