const { DataTypes } = require("sequelize");
const db = require("../conn/db");

const Usuario = db.define("Usuario", {
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
  cep: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  endereco: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  agencia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  conta: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  banco: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pix: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Usuario;
