const { Op, where } = require("sequelize");
const Pagamentos = require("../Models/pagamentos");
const Morador = require("../Models/morador");
const Unidade = require("../Models/unidade");
const Imovel = require("../Models/imovel");

module.exports = class PagamentoController {
  static async getPagamentos(req, res) {
    const { moradorId } = req.body;

    try {
      const tabelaPagamentos = await Pagamentos.findAll({
        where: { moradorId: moradorId },
      });

      if (!tabelaPagamentos) {
        return res.status(400).json({ message: "Tabela não encontrada!" });
      }

      return res.status(200).json(tabelaPagamentos);
    } catch (err) {
      console.error(err);
      return res
        .status(400)
        .json({ message: `Erro ao encontrar tabela: ${err}`, titulo: `Erro:` });
    }
  }

  static async getaAllPagamentos(req, res) {
    const usuarioId = req.user.id;

    try {
      const pagamentos = await Pagamentos.findAll({
        include: [
          {
            model: Morador,
            required: true,
            include: [
              {
                model: Unidade,
                required: true,
                include: [
                  {
                    model: Imovel,
                    required: true,
                    where: { usuarioId: usuarioId },
                  },
                ],
              },
            ],
          },
        ],
      });

      console.log(pagamentos);

      return res.json(pagamentos);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: `Erro ao buscar pagamentos, ${error}!`,
        titulo: `Erro:`,
      });
    }
  }

  static async addPagamento(req, res) {
    const { moradorId, dataVencimento, dataPagamento, valor, status } =
      req.body;

    try {
      const pagamentoEncontrado = await Pagamentos.findOne({
        where: { moradorId, dataVencimento },
      });

      if (!pagamentoEncontrado) {
        return res.status(404).json({
          message: `Nenhum pagamento encontrado para esse morador com a data de vencimento informada.`,
          titulo: `Pagamento não encontrado`,
        });
      }

      await Pagamentos.update(
        {
          dataPagamento,
          dataVencimento,
          valor,
          status: "Pago",
        },
        {
          where: { id: pagamentoEncontrado.id },
        }
      );

      return res.status(200).json({
        message: `Pagamento registrado com sucesso!`,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: `Erro ao registrar pagamento: ${err.message}`,
        titulo: "Erro",
      });
    }
  }
};
