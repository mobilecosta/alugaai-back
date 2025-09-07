const Usuario = require("../Models/usuario");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = class AuthController {
  static async cadastrarUsuario(req, res) {
    const {
      nome,
      dataNascimento,
      rg,
      cpf,
      cep,
      banco,
      conta,
      agencia,
      endereco,
      pix,
      telefone,
      email,
      senha,
      senhaConfirmada,
    } = req.body;

    const findUser = await Usuario.findOne({ where: { email: email } });

    if (findUser) {
      return res
        .status(400)
        .json({ message: "O E-mail já está em uso, tente novamente!" });
    }

    if (senha != senhaConfirmada) {
      return res.status(400).json({ message: "As senhas estão diferentes!" });
    }

    const salt = bcrypt.genSaltSync(10);
    const senhaCriptogafada = bcrypt.hashSync(senha, salt);

    const usuario = {
      nome: nome,
      dataNascimento: dataNascimento,
      rg: rg,
      cep: cep,
      cpf: cpf,
      endereco: endereco,
      banco: banco,
      agencia: agencia,
      conta: conta,
      pix: pix,
      telefone: telefone,
      email: email,
      senha: senhaCriptogafada,
    };

    try {
      const userCreate = await Usuario.create(usuario);

      const token = jwt.sign(
        {
          id: userCreate.id,
          email: userCreate.email,
        },
        JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      console.log("Usuário criado com sucesso!");
      return res.status(201).json({
        message: "Usuário criado com sucesso!",
        usuario: { id: userCreate.id },
      });
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Erro ao criar usuário, verifique os dados!" });
      console.error(err);
    }
  }

  static async login(req, res) {
    const { email, senha } = req.body;

    const user = await Usuario.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(400)
        .json({ message: "E-mail inválido, tente novamente!" });
    }

    const senhaMatch = bcrypt.compareSync(senha, user.senha);

    if (!senhaMatch) {
      return res
        .status(400)
        .json({ message: "Senha incorreta, tente novamente!" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: `Bem vindo, ${user.nome.split(" ")[0]}`,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        pix: user.pix,
        telefone: user.telefone,
      },
    });
  }

  static async encontrarUsuario(req, res) {
    const email = req.body.email;
    try {
      const usuario = await Usuario.findOne({ where: { email: email } });

      if (!usuario) {
        return res.status(400).json({ message: "Usuário não encontrado!" });
      }

      return res.status(200).json(usuario);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Erro ao buscar usuário!" });
    }
  }

  static async recuperarSenha(req, res) {
    const { usuarioId, senha, confirmarSenha } = req.body;

    try {
      if (senha !== confirmarSenha) {
        return res.status(400).json({
          message:
            "A senha de confirmação e a senha não batem, tente novamente!",
        });
      }
      const salt = bcrypt.genSaltSync(10);
      const senhaCriptogafada = bcrypt.hashSync(senha, salt);

      await Usuario.update(
        { senha: senhaCriptogafada },
        { where: { id: usuarioId } }
      );
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Erro ao atualizar senha!" });
    }
  }

  static async getToken(req, res) {
    const token = req.cookies.token;
    if (!token) return res.json(false);

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return res.json(true);
    } catch (err) {
      return res.json(false);
    }
  }

  static async logout(req, res) {
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Logout feito com sucesso!" });
  }

  static async buscarUsuarioPorId(req, res) {
    const id = req.body.id;

    if (!id) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    try {
      const usuarioEncontrado = await Usuario.findOne({ where: { id: id } });
      return res.status(200).json(usuarioEncontrado);
    } catch (err) {
      console.error(err);
    }
  }

  static async alterarSenha(req, res) {
    const { id, senhaAtual, novaSenha, confirmarSenha } = req.body;

    if (novaSenha != confirmarSenha) {
      return res
        .status(400)
        .json({ message: "As senhas não batem, tente novamente!" });
    }

    try {
      const usuarioEncontrado = await Usuario.findOne({ where: { id: id } });

      if (senhaAtual) {
        const senhaMatch = bcrypt.compareSync(
          senhaAtual,
          usuarioEncontrado.senha
        );

        if (!senhaMatch) {
          return res
            .status(400)
            .json({ message: "A senha atual está errada, tente novamente!" });
        }
      }

      const salt = bcrypt.genSaltSync(10);
      const senhaCriptogafada = bcrypt.hashSync(novaSenha, salt);

      await Usuario.update({ senha: senhaCriptogafada }, { where: { id: id } });

      return res.status(200).json({ message: "Senha atualizada com sucesso!" });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Erro ao atualizar a senha" });
    }
  }

  static async atualizarUsuario(req, res) {
    const {
      id,
      tempoContratoPadrao,
      vencimentoPadrao,
      reajusteAnual,
      boletoAutomatico,
      descontoPagamentoAntecimado,
      valorDescontoAntecipado,
      nome,
      telefone,
      endereco,
      cep,
      rg,
      cpf,
      banco,
      agencia,
      conta,
      pix,
    } = req.body;

    try {
      const usuario = Usuario.findOne({ where: { id: id } });

      if (!usuario) {
        return res.status(400).json({ message: "Usuário não encontrado!" });
      }

      await Usuario.update(
        {
          nome: nome,
          telefone: telefone,
          endereco: endereco,
          rg: rg,
          cpf: cpf,
          cep: cep,
          banco: banco,
          agencia: agencia,
          conta: conta,
          pix: pix,
        },
        { where: { id: id } }
      );

      return res
        .status(200)
        .json({ message: "Configurações atualizadas com sucesso!" });
    } catch (err) {
      console.error(err);
      return res
        .status(400)
        .json({ message: "Erro ao atualizar configurações!" });
    }
  }
};
