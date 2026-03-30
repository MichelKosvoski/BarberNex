const express = require("express");
const controller = require("../controllers/master.controller");

const router = express.Router();

router.get("/resumo", controller.resumoMaster);
router.get("/planos", controller.listarPlanosPlataformaMaster);
router.get("/planos-publicos", controller.listarPlanosPlataformaMaster);
router.post("/planos", controller.criarPlanoPlataformaMaster);
router.put("/planos/:id", controller.atualizarPlanoPlataformaMaster);
router.delete("/planos/:id", controller.removerPlanoPlataformaMaster);
router.get("/barbearias", controller.listarBarbeariasMaster);
router.get("/usuarios", controller.listarUsuariosMaster);
router.post("/usuarios", controller.criarUsuarioMaster);
router.put("/usuarios/:id", controller.atualizarUsuarioMaster);
router.put("/barbearias/:id", controller.atualizarBarbeariaMaster);
router.get("/cobrancas", controller.listarCobrancasMaster);
router.post("/cobrancas", controller.criarCobrancaMaster);
router.post("/cobrancas/:id/checkout", controller.gerarCheckoutCobrancaMaster);
router.put("/cobrancas/:id", controller.atualizarCobrancaMaster);
router.delete("/cobrancas/:id", controller.removerCobrancaMaster);
router.post("/webhooks/mercadopago", controller.webhookMercadoPagoMaster);

module.exports = router;
