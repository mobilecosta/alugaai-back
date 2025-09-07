const { DataTypes } = require("sequelize");
const db = require("../conn/db");

const Unidade = db.define("Unidade", {
  imovelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  numeroUnidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comodos: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valorAluguel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  instalacaoAgua: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  instalacaoLuz: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ocupada: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

module.exports = Unidade;
