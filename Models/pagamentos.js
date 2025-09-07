const { DataTypes } = require("sequelize");
const db = require("../conn/db");

const Pagamentos = db.define("Pagamentos", {
  moradorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dataVencimento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dataPagamento: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  valor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Pagamentos;
