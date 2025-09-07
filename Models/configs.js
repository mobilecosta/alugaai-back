const { DataTypes } = require("sequelize");
const db = require("../conn/db");

const Config = db.define("Config", {
  duracaoPadraodoContrato: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vencimentoPadrao: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reajusteAnual: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  enviarBoletoAutomatico: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  descontoPagamentoAntecipado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  pixCadastrado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Config;
