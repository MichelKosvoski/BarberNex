const express = require("express");
const controller = require("../controllers/master.controller");

const router = express.Router();

router.get("/resumo", controller.resumoMaster);
router.get("/barbearias", controller.listarBarbeariasMaster);
router.put("/barbearias/:id", controller.atualizarBarbeariaMaster);
router.get("/cobrancas", controller.listarCobrancasMaster);
router.post("/cobrancas", controller.criarCobrancaMaster);
router.put("/cobrancas/:id", controller.atualizarCobrancaMaster);
router.delete("/cobrancas/:id", controller.removerCobrancaMaster);

module.exports = router;
