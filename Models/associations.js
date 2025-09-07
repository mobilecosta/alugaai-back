const Usuario = require("./usuario");
const Imovel = require("./imovel");
const Unidade = require("./unidade");
const Morador = require("./morador");
const Pagamentos = require("./pagamentos");
const Config = require("./configs");

Usuario.hasMany(Imovel, { foreignKey: "usuarioId", onDelete: "CASCADE" });

Imovel.belongsTo(Usuario, { foreignKey: "usuarioId", onDelete: "CASCADE" });

Imovel.hasMany(Unidade, { foreignKey: "imovelId" });
// Unidade pertence a um Imovel
Unidade.belongsTo(Imovel, {
  foreignKey: "imovelId",
  onDelete: "CASCADE",
});

// Morador pertence a uma Unidade
Morador.belongsTo(Unidade, {
  foreignKey: "unidadeId",
  onDelete: "CASCADE",
});

// Unidade tem um Morador
Unidade.hasMany(Morador, {
  foreignKey: "unidadeId",
  onDelete: "SET NULL",
});

// Morador pode ter vários Pagamentos
Morador.hasMany(Pagamentos, {
  foreignKey: "moradorId",
  onDelete: "CASCADE",
});

Pagamentos.belongsTo(Morador, {
  foreignKey: "moradorId",
  onDelete: "CASCADE",
});

module.exports = {
  Usuario,
  Imovel,
  Unidade,
  Morador,
  Pagamentos,
  Config,
};
