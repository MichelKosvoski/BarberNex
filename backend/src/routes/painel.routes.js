const express = require("express");
const controller = require("../controllers/painel.controller");

const router = express.Router();

router.get("/:barbeariaId/resumo", controller.resumoPainel);
router.get("/:barbeariaId/relatorios", controller.relatoriosPainel);

module.exports = router;
