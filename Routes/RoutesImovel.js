const express = require("express");
const ImovelController = require("../controller/imovelController");
const contratoCOntroler = require("../utils/gerenciarContrato");
const authMiddleware = require("../middlewares/authMiddleware");
const imovelRoutes = express.Router();

imovelRoutes.post("/add", ImovelController.addImovel);
imovelRoutes.post("/add/unidade", authMiddleware, ImovelController.addUnidade);
imovelRoutes.get("/buscar", authMiddleware, ImovelController.getAllImoveis);
imovelRoutes.post(
  "/buscar/unidades",
  authMiddleware,
  ImovelController.getUnidades
);
imovelRoutes.post("/add/morador", authMiddleware, ImovelController.addMorador);
imovelRoutes.post(
  "/criar/contrato",
  authMiddleware,
  contratoCOntroler.criarContrato
);
imovelRoutes.post(
  "/buscar/unidades/morador",
  authMiddleware,
  ImovelController.getMorador
);
imovelRoutes.get(
  "/consultar/:id",
  authMiddleware,
  ImovelController.detalharUnidade
);
imovelRoutes.post(
  "/deletar/morador",
  authMiddleware,
  ImovelController.deleteMorador
);
imovelRoutes.post(
  "/deletar/unidade",
  authMiddleware,
  ImovelController.deleteUnidade
);
imovelRoutes.get(
  "/buscar/unidades/morador/:moradorId",
  authMiddleware,
  ImovelController.getMoradorId
);
imovelRoutes.put(
  "/atualizar/unidade",
  authMiddleware,
  ImovelController.updateMorador
);

module.exports = imovelRoutes;
