const { DataTypes } = require("sequelize");
const db = require("../conn/db");

const Moradores = db.define("Moradores", {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dataNascimento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rg: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  diaVencimento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inicioContrato: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fimContrato: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contrato: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  unidadeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Moradores;
