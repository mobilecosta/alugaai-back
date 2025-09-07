const { DataTypes } = require("sequelize");
const db = require("../conn/db");

const Imoveis = db.define("Imoveis", {
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nomePredio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantidadeUnidades: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  rua: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bairro: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cidade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cep: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Imoveis;
