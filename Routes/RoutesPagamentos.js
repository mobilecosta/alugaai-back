const express = require("express");
const PagamentoController = require("../controller/pagamentoController");
const authMiddleware = require("../middlewares/authMiddleware");
const pagamentosRoutes = express.Router();

pagamentosRoutes.post(
  "/buscar",
  authMiddleware,
  PagamentoController.getPagamentos
);
pagamentosRoutes.put(
  `/registrar`,
  authMiddleware,
  PagamentoController.addPagamento
);
pagamentosRoutes.get(
  `/buscar/todos`,
  authMiddleware,
  PagamentoController.getaAllPagamentos
);

module.exports = pagamentosRoutes;
