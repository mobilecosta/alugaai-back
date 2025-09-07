const { where, Op } = require("sequelize");
const Imovel = require("../Models/imovel");
const Morador = require("../Models/morador");
const Unidade = require("../Models/unidade");
const Pagamentos = require("../Models/pagamentos");
const Contrato = require("../utils/gerenciarContrato");

module.exports = class ImovelController {
  static async addImovel(req, res) {
    const {
      nomePredio,
      quantidadeUnidades,
      cep,
      estado,
      cidade,
      comodos,
      bairro,
      valorAluguel,
      rua,
      usuarioId,
    } = req.body;

    const novoImovel = {
      nomePredio: nomePredio,
      quantidadeUnidades: quantidadeUnidades,
      cep: cep,
      estado: estado,
      cidade: cidade,
      bairro: bairro,
      rua: rua,
      usuarioId: usuarioId,
    };
    console.log("dados recebidos: " + req.body);
    try {
      const findImovel = await Imovel.findOne({
        where: { nomePredio: nomePredio },
      });

      if (!findImovel) {
        const imovelCriado = await Imovel.create(novoImovel);

        if (quantidadeUnidades > 0) {
          const unidades = [];

          for (let i = 1; i <= quantidadeUnidades; i++) {
            unidades.push({
              imovelId: imovelCriado.id,
              numeroUnidade: i,
              valorAluguel: valorAluguel,
              comodos: comodos,
              ocupada: false,
            });
          }

          await Unidade.bulkCreate(unidades);
        }
        return res.status(201).json({ message: "Imóvel criado com sucesso" });
      } else {
        return res
          .status(401)
          .json({ message: "O nome desse imóvel já está em uso" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro interno ao criar imóvel." });
    }
  }

  static async getAllImoveis(req, res) {
    const usuarioId = req.user.id;

    try {
      const imoveis = await Imovel.findAll({
        where: { usuarioId: usuarioId },
        include: { model: Unidade, include: Morador },
      });
      return res.json(imoveis);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao buscar imóveis" });
    }
  }

  static async addUnidade(req, res) {
    const {
      imovelId,
      numeroUnidade,
      valorAluguel,
      comodos,
      instalacaoLuz,
      instalacaoAgua,
      ocupada,
      diaVencimento,
      morador,
      dataNascimento,
      rg,
      cpf,
      dataInicioContrato,
      dataFimContrato,
      telefone,
      email,
    } = req.body;

    try {
      const encontrarImovel = await Imovel.findOne({
        where: { id: imovelId },
      });

      if (!encontrarImovel) {
        return res
          .status(400)
          .json({ message: "Imóvel não encontrado", titulo: "Erro:" });
      }

      const encontrarUnidade = await Unidade.findOne({
        where: { imovelId: imovelId, numeroUnidade: numeroUnidade },
      });

      if (encontrarUnidade) {
        return res.status(409).json({
          message: "Já existe uma unidade nesse imóvel com esse número!",
          titulo: "Erro:",
        });
      }

      const unidade = {
        imovelId: imovelId,
        numeroUnidade: numeroUnidade,
        comodos: comodos,
        valorAluguel: valorAluguel,
        instalacaoAgua: instalacaoAgua,
        instalacaoLuz: instalacaoLuz,
        ocupada: ocupada,
      };

      const unidadeCriada = await Unidade.create(unidade);

      await Imovel.increment(
        { quantidadeUnidades: 1 },
        { where: { id: imovelId } }
      );

      if (ocupada) {
        const moradorData = {
          nome: morador,
          dataNascimento: dataNascimento,
          rg: rg,
          cpf: cpf,
          inicioContrato: dataInicioContrato,
          fimContrato: dataFimContrato,
          telefone: telefone,
          email: email,
          diaVencimento: diaVencimento,
          ativo: 1,
          unidadeId: unidadeCriada.id,
        };

        const moradorCriado = await Morador.create(moradorData);

        await unidadeCriada.update({ moradorId: moradorCriado.id });

        let vencimentos = [];
        const inicio = new Date(dataInicioContrato);
        const fim = new Date(dataFimContrato);

        while (inicio <= fim) {
          const dataVencimento = new Date(
            inicio.getFullYear(),
            inicio.getMonth(),
            diaVencimento
          )
            .toISOString()
            .slice(0, 10);

          vencimentos.push({
            moradorId: moradorCriado.id,
            dataVencimento,
            dataPagamento: null,
            valor: valorAluguel,
            status: "Pendente",
          });

          inicio.setMonth(inicio.getMonth() + 1);
        }

        await Pagamentos.bulkCreate(vencimentos);

        return res.status(201).json({
          message: "Unidade cadastrada com sucesso!",
          titulo: "Sucesso:",
        });
      }

      return res.status(201).json({
        message: "Unidade cadastrada como vaga!",
        titulo: "Sucesso:",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro interno ao cadastrar unidade",
        titulo: "Erro:",
      });
    }
  }

  static async getUnidades(req, res) {
    const { imovelId } = req.body;

    if (imovelId) {
      try {
        const encontrarUnidades = await Unidade.findAll({
          where: { imovelId: imovelId },
          include: [Morador],
        });

        if (encontrarUnidades.length == 0) {
          return res
            .status(409)
            .json({ message: "Esse imóvel não possui unidades cadastradas!" });
        }

        return res.status(200).json(encontrarUnidades);
      } catch (error) {
        console.error("Erro ao buscar unidades:", error);
        return res
          .status(500)
          .json({ message: "Erro interno ao buscar unidades" });
      }
    }
  }

  static async addMorador(req, res) {
    const {
      nome,
      dataNascimento,
      rg,
      cpf,
      dataInicioContrato,
      dataFimContrato,
      diaVencimento,
      telefone,
      email,
      unidadeId,
      valorAluguel,
      imovelId,
    } = req.body;

    try {
      const encontrarUnidade = await Unidade.findOne({
        where: { id: unidadeId, imovelId: imovelId },
      });

      if (!encontrarUnidade) {
        return res
          .status(409)
          .json({ message: "Unidade não encontrada!", titulo: "Erro:" });
      }

      const encontrarMorador = await Morador.findOne({
        where: { [Op.or]: { nome: nome, cpf: cpf } },
      });

      if (encontrarMorador) {
        return res.status(409).json({
          message: "Morador já cadastrado, tente novamente!",
          titulo: "Erro:",
        });
      }

      const morador = {
        nome: nome,
        dataNascimento: dataNascimento,
        rg: rg,
        cpf: cpf,
        inicioContrato: dataInicioContrato,
        fimContrato: dataFimContrato,
        telefone: telefone,
        diaVencimento: diaVencimento,
        email: email,
        unidadeId: unidadeId,
      };

      const novoMorador = await Morador.create(morador);

      let vencimentos = [];
      const dataInicio = new Date(dataInicioContrato);
      const dataFim = new Date(dataFimContrato);

      while (dataInicio <= dataFim) {
        const dataVencimento = new Date(
          dataInicio.getFullYear(),
          dataInicio.getMonth(),
          diaVencimento
        )
          .toISOString()
          .slice(0, 10);

        vencimentos.push({
          moradorId: novoMorador.id,
          dataVencimento: dataVencimento,
          dataPagamento: null,
          valor: valorAluguel,
          status: "Pendente",
        });

        dataInicio.setMonth(dataInicio.getMonth() + 1);
      }

      try {
        const criarPagamento = await Pagamentos.bulkCreate(vencimentos);
      } catch (err) {
        console.error("Erro ao criar os pagamentos:", err);
        return res.status(500).json({
          message: "Erro ao criar pagamentos!",
          titulo: "Erro:",
        });
      }

      await Unidade.update(
        {
          moradorId: novoMorador.id,
          ocupada: true,
        },
        { where: { id: unidadeId, imovelId: imovelId, ocupada: false } }
      );

      return res.status(200).json({
        message: `Morador cadastrado com sucesso na unidade ${encontrarUnidade.numeroUnidade}!`,
        titulo: `Sucesso:`,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        message: "Erro ao cadastrar morador: " + err,
        titulo: "Erro:",
      });
    }
  }

  static async updateMorador(req, res) {
    const {
      moradorId,
      unidadeId,
      telefone,
      rg,
      cpf,
      email,
      valorAluguel,
      instalacaoAgua,
      instalacaoLuz,
      fimContrato,
      diaVencimento,
    } = req.body;

    try {
      await Unidade.update(
        {
          valorAluguel: valorAluguel,
          instalacaoAgua: instalacaoAgua,
          instalacaoLuz: instalacaoLuz,
        },
        { where: { id: unidadeId } }
      );

      if (moradorId) {
        await Morador.update(
          {
            telefone: telefone,
            rg: rg,
            email: email,
            cpf: cpf,
            fimContrato: fimContrato,
            diaVencimento: diaVencimento,
          },
          { where: { id: moradorId } }
        );

        const hoje = new Date();

        await Pagamentos.update(
          {
            valor: valorAluguel,
          },
          {
            where: {
              moradorId: moradorId,
              status: "Pendente",
              dataVencimento: { [Op.gte]: hoje },
            },
          }
        );
      }

      return res
        .status(200)
        .json({ message: "Dados atualizados com sucesso!" });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Erro ao atualizar dados!" });
    }
  }

  static async getMorador(req, res) {
    const unidadeId = req.body.unidadeId;
    try {
      const encontrarMorador = await Morador.findOne({
        where: { unidadeId: unidadeId },
      });

      if (!encontrarMorador) {
        return res
          .status(409)
          .json({ message: "Morador não encontrado!", titulo: "Erro:" });
      }

      return res.status(200).json(encontrarMorador);
    } catch (err) {
      console.error(err);
    }
  }

  static async getMoradorId(req, res) {
    const moradorId = req.params.moradorId;

    try {
      const encontrarMorador = await Morador.findOne({
        where: { id: moradorId },
      });

      if (!encontrarMorador) {
        return res.status(400).json({ message: "Morador não encontrado!" });
      }

      return res.status(200).json(encontrarMorador);
    } catch (err) {
      console.error.err;
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  static async deleteMorador(req, res) {
    const { moradorId, unidadeId } = req.body;

    console.log("BODY:", req.body);

    try {
      await Morador.update({ ativo: false }, { where: { id: moradorId } });
      await Unidade.update({ ocupada: false }, { where: { id: unidadeId } });

      return res.status(200).json({ message: "Morador excluído com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao excluir morador." });
    }
  }

  static async deleteUnidade(req, res) {
    const unidadeId = req.body.unidadeId;

    try {
      await Unidade.destroy({ where: { id: unidadeId } });
      return res.status(200).json({ message: "Unidade excluída com sucesso!" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao excluir unidade." });
    }
  }

  static async detalharUnidade(req, res) {
    const id = req.params.id;

    const encontrarUnidade = await Unidade.findOne({
      where: { id: id },
      include: [Morador],
    });

    if (!encontrarUnidade) {
      return res
        .status(400)
        .json({ message: "Unidade não encontrada!", titulo: "Erro:" });
    }

    return res.status(200).json(encontrarUnidade);
  }
};
