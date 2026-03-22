const express = require("express");
const controller = require("../controllers/pdv.controller");

const router = express.Router();

router.get("/barbearia/:barbeariaId/vendas", controller.listarVendas);
router.get("/vendas/:vendaId/itens", controller.listarVendaItens);
router.post("/barbearia/:barbeariaId/vendas", controller.criarVenda);

module.exports = router;
