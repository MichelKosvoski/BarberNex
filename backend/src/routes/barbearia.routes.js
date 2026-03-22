// Importa express
const express = require("express");

// Cria roteador
const router = express.Router();

// Importa controller
const controller = require("../controllers/barbearia.controller");

/*
  ROTA:
  GET /api/barbearias
*/
router.get("/", controller.listarBarbearias);

/*
  ROTA:
  GET /api/barbearias/1
*/
router.get("/:id", controller.buscarBarbeariaPorId);
router.put("/:id", controller.atualizarBarbearia);

/*
  ROTA:
  GET /api/barbearias/1/barbeiros
*/
router.get("/:id/barbeiros", controller.listarBarbeiros);

/*
  ROTA:
  GET /api/barbearias/1/servicos
*/
router.get("/:id/servicos", controller.listarServicos);

// Exporta rotas
module.exports = router;
