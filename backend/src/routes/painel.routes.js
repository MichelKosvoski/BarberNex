const express = require("express");
const controller = require("../controllers/painel.controller");

const router = express.Router();

router.get("/:barbeariaId/resumo", controller.resumoPainel);

module.exports = router;
