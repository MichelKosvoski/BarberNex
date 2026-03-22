const express = require("express");
const controller = require("../controllers/produtos.controller");

const router = express.Router();

router.get("/barbearia/:barbeariaId", controller.listarProdutos);
router.post("/barbearia/:barbeariaId", controller.criarProduto);
router.put("/:id", controller.atualizarProduto);
router.delete("/:id", controller.removerProduto);

module.exports = router;
