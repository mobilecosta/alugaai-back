const { Sequelize } = require("sequelize");

const sequelize = process.env.DB_URL
  ? new Sequelize(process.env.DB_URL, { dialect: "mysql", logging: false })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || "mysql",
        logging: false,
      }
    );

try {
  sequelize.authenticate();
  console.log("Conectado ao banco!");
} catch (err) {
  console.error("Erro ao conectar:", err);
}

module.exports = sequelize;
