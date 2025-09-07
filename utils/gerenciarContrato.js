const fs = require("fs");
const path = require("path");
const Unidade = require("../Models/unidade");
const Imovel = require("../Models/imovel");
const Morador = require("../Models/morador");
const Usuario = require("../Models/usuario");
const PDF = require("pdfkit");
const multer = require("multer");
const cloudinary = require("cloudinary");
const { where } = require("sequelize");
const upload = multer({ dest: "../contratos/" });
require("dotenv").config();

module.exports = class contratoController {
  static async criarContrato(req, res) {
    const { unidadeId } = req.body;

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_KEY,
      api_secret: process.env.CLOUD_SECRET,
    });

    try {
      const unidade = await Unidade.findOne({
        where: { id: unidadeId },
        include: [{ model: Imovel }, { model: Morador, where: { ativo: 1 } }],
      });
      console.log("unidade ", unidade);
      const imovel = unidade.Imovei;
      console.log("imovel ", imovel);
      const moradorAtivo = unidade.Moradores?.[0];
      const moradorId = moradorAtivo.id;
      console.log("morador ativo id: ", moradorId);
      const morador = await Morador.findOne({ where: { id: moradorId } });
      console.log("morador: ", morador);
      const usuarioId = req.user.id;
      const usuario = await Usuario.findOne({ where: { id: usuarioId } });

      function formatarCPF(cpf) {
        return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
      }

      function formatarRG(rg) {
        return rg.replace(/^(\d{2})(\d{3})(\d{3})(\d?)$/, "$1.$2.$3-$4");
      }

      const moradorNome = morador.nome;
      const moradorCpf = formatarCPF(morador.cpf);
      const moradorRg = formatarRG(morador.rg);
      const imovelEndereco = `${imovel.rua}, ${imovel.bairro} - ${imovel.cidade} - ${imovel.estado}`;
      const dataInicioContrato = new Date(
        morador.inicioContrato
      ).toLocaleDateString("pt-BR");
      const dataFimContrato = new Date(morador.fimContrato).toLocaleDateString(
        "pt-BR"
      );
      const valorAluguel = unidade.valorAluguel;
      const unidadeComodos = unidade.comodos;
      const diaVencimento = morador.diaVencimento;
      const usuarioNome = usuario.nome;
      const cidade = imovel.cidade;
      const usuarioDataNascimento = new Date(
        usuario.dataNascimento
      ).toLocaleDateString("pt-BR");
      const usuarioRg = formatarRG(usuario.rg);
      const usuarioCpf = formatarCPF(usuario.cpf);
      const usuarioEndereco = usuario.endereco;
      const usuarioAgencia = usuario.agencia;
      const usuarioConta = usuario.conta;
      console.log("usuario id", usuarioId);
      const dados = {
        moradorNome,
        moradorCpf,
        moradorRg,
        dataFimContrato,
        dataInicioContrato,
        valorAluguel,
        diaVencimento,
        usuarioNome,
        usuarioDataNascimento,
        usuarioRg,
        usuarioCpf,
        usuarioEndereco,
      };

      const dir = path.join(__dirname, "..", "contratos");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      const doc = new PDF();
      const nomeArquivo = `contrato-${moradorNome.replace(/\s+/g, "_")}.pdf`;
      const caminho = path.join(dir, nomeArquivo);

      const writeStream = fs.createWriteStream(caminho);

      doc.pipe(writeStream);

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("CONTRATO DE LOCAÇÃO DE IMÓVEL PARA FINS RESIDENCIAIS", {
          align: "center",
        });

      doc.moveDown();
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `Por este instrumento particular de locação, de um lado, na qualidade de LOCADOR:`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(
          `Sr. ${usuarioNome}, portador da célula RG nº ${usuarioRg} e inscrito no CPF/MF sob o nº ${usuarioCpf} residente e domiciliado na Rua: ${usuarioEndereco}.`
        );

      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`E, de outro, na qualidade de LOCATÁRIO:`);

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(
          `${moradorNome}, portador(a) de célula RG nº ${moradorRg} e CPF nº ${moradorCpf}, residente e domiciliado à ${imovelEndereco}.`
        );

      doc.moveDown();
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `Têm entre si, justo e contratado a locação do imóvel, consubstanciado em casa
apartamento de ${unidadeComodos} cômodos, de legitima propriedade e posse do LOCADOR, situado no seguinte endereço: 
`,
          { continued: true }
        );
      doc.font("Helvetica-Bold").fontSize(12).text(`${imovelEndereco}.`);

      doc.moveDown();

      doc
        .font(`Helvetica-Bold`)
        .fontSize(12)
        .text(`Cláusula 1ª -`, { continued: true });
      doc.font(`Helvetica`).fontSize(12)
        .text(`O prazo de vigência deste contrato é de 12 (doze) meses, iniciando em ${dataInicioContrato} e terminando em ${dataFimContrato}, data em que o LOCATÁRIO se compromete a entregar o imóvel completamente livre e desocupado, independente do aviso ou notificação, nas condições previstas neste contrato, sob pena de incorrer na multa da clausula 15ª (proporcional ao tempo restante para o termino do contrato) e de sujeitar-se ao disposto no artigo 575 do Código Civil Brasileiro.
Parágrafo primeiro: Havendo interesse na renovação do presente contrato, o LOCATÁRIO deverá manifestar-se, através de notificação extrajudicial dirigida ao LOCADOR, com antecedência de no mínimo 60 (sessenta) dias do vencimento deste.
Parágrafo segundo: Fica desde já o LOCADOR ou seu representante legal, autorizado a ocupar o imóvel locado, independentemente de ação judicial ou medida de emissão de posse, sem quaisquer outras formalidades e sem prejuízo das demais clausulas se
condições do presente contrato ou disposições legais, caso o imóvel venha ser, comprovadamente, abandonado pelo LOCATÁRIO.
Parágrafo terceiro: O eventual abandono do imóvel locado, caracterizar-se-á, desde que se verifique estar o mesmo permanentemente fechado e sem pessoas zelando por sua guarda e conservação, com aluguéis e/ou contas em e encargos em atraso, ocasião em que
na presença de testemunhas será procedida a retomada sob imóvel pelo LOCADOR para evitar-se depredações de terceiros, sendo que eventuais bens móveis existentes em seu interior ficarão depositados em local apropriado, cuja guarda e ônus arcará,
exclusivamente, o LOCATÁRIO.`);

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 2ª –`, { continued: true });
      doc.font("Helvetica").fontSize(12)
        .text(` O imóvel objeto deste contrato destina-se, única e exclusivamente, para fins
RESIDENCIAIS, sendo vedada mudança de destinação.`);

      doc.moveDown();

      // cláusula 3
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Cláusula 3ª – ", { continued: true });
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`O aluguel mensal corresponde a R$ ${valorAluguel},00.`);
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `Parágrafo primeiro: O LOCATÁRIO pagará ao LOCADOR a importância de R$ ${valorAluguel}. Valor que será descontado no final do contrato de aluguel.`
        );
      doc.moveDown();

      // cláusula 4
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Cláusula 4ª – ", { continued: true });
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `Compromete-se o LOCATÁRIO, a quitar além do aluguel estipulado, as demais despesas referentes ao imóvel locado.`
        );
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `a) Os impostos, taxas e tarifas que recaem ou venham a recair sobre o imóvel locado ou sobre serviços públicos a ele relativos, ficarão INTEGRALMENTE a cargo do LOCATÁRIO, cujos pagamentos efetuar-se-ão nas datas dos respectivos vencimentos, devendo comprovar o recolhimento, com o fornecimento de cópias dos pagamentos, ao LOCADOR, mensalmente.`
        );
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `b) O LOCATÁRIO arcará com os gastos de toda e qualquer reforma, como pinturas e consertos.`
        );
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `c) O LOCATÁRIO arcará com os gastos relativos à manutenção do empreendimento, bem como as despesas de energia elétrica, abastecimento de água e telefônicas.`
        );
      doc.moveDown();

      // cláusula 5
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Cláusula 5ª – ", { continued: true });
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `O aluguel deverá ser pago, pontualmente, no dia ${diaVencimento} de cada mês subsequente ao vencimento, diretamente ao LOCADOR, através da conta bancária Bradesco agência: ${usuarioAgencia}0160-0 nº conta: ${usuarioConta}.`
        );
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `a) Em caso de atraso no pagamento do aluguel, ficará o LOCATÁRIO sujeito ao pagamento de multa de 10% (dez por cento) sobre o valor mensal.`
        );
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `b) Em caso de atraso no pagamento do aluguel, ficará o locatário sujeito ao pagamento de juros de mora de 1% (um por cento) ao mês, e correção monetária aplicada desde a data do vencimento até o efetivo pagamento.`
        );
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `c) O não pagamento do aluguel na data estipulada acarretará a adoção de medidas judiciais cabíveis.`
        );
      doc.moveDown();

      // cláusula 6
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Cláusula 6ª – ", { continued: true });
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `O LOCATÁRIO declara receber o imóvel em perfeito estado, obrigando-se:`
        );
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `a) a manter o imóvel objeto da locação no mais perfeito estado de conservação e limpeza, para assim o restituir, quando finda ou rescinda a locação, na forma em que recebeu;`
        );
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `b) a efetuar todas as obras e reparos de que necessite a unidade locada, efetuados os que digam respeito à sua própria estrutura, correndo por sua conta as despesas correspondentes, devendo, ainda, trazer em estado de conservação e de limpeza as pinturas, aparelhos sanitários, portas, fechaduras, trincos, vidraças, lustres, instalações elétricas, torneiras e quaisquer outros acessórios ou componentes do imóvel;`
        );
      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `c) a não utilizar pregos que possam danificar as paredes, ficando responsável, em qualquer caso, pelos danos causados.`
        );
      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 7ª –`, { continued: true });
      doc.font(`Helvetica`).fontSize(12)
        .text(`Toda e qualquer benfeitoria, modificação ou transformação feita no imóvel pelo LOCATÁRIO deverá ser precedida de autorização por escrito do LOCADOR, ficando incorporada à unidade locada, sem direito de indenização ou de retenção.
        Parágrafo primeiro: Caso esta cláusula não seja rigorosamente obedecida, estará configurada a quebra contratual pelo LOCATÁRIO, que levará a rescisão do presente contrato.
        Parágrafo segundo: O LOCADOR poderá determinar que ao LOCATÁRIO reponha tudo no estado anterior.`);

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 8ª –`, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          ` O LOCATÁRIO não poderá sublocar, ceder ou emprestar, parcial ou totalmente, o imóvel locado, nem transferir este contrato.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 9ª –`, { continued: true });
      doc.font(`Helvetica`).fontSize(12)
        .text(` a – Compromete-se ao LOCATÁRIO a chegar às mãos do LOCADOR os avisos e comunicações oficiais ou não, que digam respeito à coisa locada, sob pena de responder pelos prejuízos e danos que causar sua desídia, independentemente de qualquer outra compensação que neste se estipula para fim geral ou especial.
        Parágrafo primeiro - O LOCATÁRIO deverá satisfazer, as suas expensas, todas as intimações, autorizações, licenças e alvarás exigidos dos poderes públicos, constituídos em face das atividades que exercerá no imóvel locado, adequando-o, quando possível, as suas necessidades e responsabilizando-se por todas as conseqüências decorrentes da pratica e atos da atividade econômica realizada no imóvel locado.`);

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 10ª –`, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          ` O LOCATÁRIO se obriga a apresentar ao LOCADOR, devidamente quitado, os recibos de água, esgoto, energia elétrica, gás e outros de uso exclusivo do mesmo, para finda a locação, efetuar a entrega das chaves, ou sempre que o locador exigir`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 11ª – `, { continued: true });
      doc.font(`Helvetica`).fontSize(12)
        .text(`O LOCATÁRIO faculta desde já o LOCADOR, ou qualquer representante seu ou de sua procuradora, vistoriar o imóvel, quando assim entender conveniente.Parágrafo primeiro – Igual faculdade fica assegurada em caso de ser posto á venda do imóvel, observado os preceitos legais, caso em que as visitas serão realizadas por não mais que duas vezes por semana, no período das 8 às 10 e dás 14 às 18 horas, desde que o requeira por escrito, determinando os dias e horário.
        Parágrafo Segundo – O LOCATARIO será notificado por carta de eventuais irregularidades ou infrações que forem apontadas na vistoria operada, para que faça cessara irregularidade ou infração, ou promova imediatamente os reparos e consertos respectivos,no prazo de 10 (dez) dias, a contar da data de recebimento da notificação. Parágrafo Terceiro – A inércia por parte do LOCATÁRIO ensejará a rescisão do presente contrato, e a, simultânea adoção das medidas judiciais pertinentes, independentemente, de qualquer aviso ou notificação prévios, entendo-se por medidas cabíveis, aquelas tendentes a compeli-lo a efetuar os reparos necessários ou indenizar as despesas despendidas pelo LOCADOR, bem como as tendentes ao despejo.
        Parágrafo Quarto – Durante o tempo necessário aos reparos, o LOCATÁRIO responderá pelos aluguéis, acessórios e encargos devidos, para os quais concorreu com culpa, qualquer que seja sua modalidade.`);

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 12ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `No caso de venda, promessa de venda ou cessão de direitos, o LOCATÁRIO tem preferência para adquirir o prédio locado, em igualdade de condições com terceiros, devendo os proprietários dar-lhe conhecimento do negócio, mediante notificação judicial ou comprovadamente efetuada, estes na forma do artigo 27 e 28 da Lei nº 8.245/91.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 13ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `Em caso de desapropriação, parcial ou total do imóvel, a locação será considerada rescindida, não cabendo ao LOCADOR o pagamento de nenhuma indenização.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 13ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `Em caso de desapropriação, parcial ou total do imóvel, a locação será considerada rescindida, não cabendo ao LOCADOR o pagamento de nenhuma indenização.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 14ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `Nenhuma intimação do Poder Público que comprove a imprestabilidade, será motivo para que se opere a rescisão do presente contrato, salvo precedendo vistoria judicial que comprove a imprestabilidade absoluta da coisa locada par os fins a que se destina.
          Parágrafo único – Obriga-se o LOCATÁRIO a satisfazer todas as exigências dos poderes públicos e intimações dos serviços sanitários a que der causa.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 15ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `À parte que infringir qualquer das clausulas deste contrato, pagará à outra a multa correspondente a TRÊS VEZES O VALOR LOCATIVO MENSAL, devido na época em que se verificar a infração, sempre devida integralmente, qualquer que seja o
          tempo decorrido da vigência do prazo, com a faculdade, para a parte inocente, de exigir o cumprimento do contrato ou de considerá-lo rescindido.
          Parágrafo único – O pagamento da multa estipulada nesta cláusula não exime ao LOCATÁRIO de efetuar o pagamento dos aluguéis e encargos vencidos, nem de ressarcir os danos porventura causados no imóvel.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 16ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `Com expressa renúncia de qualquer outro, por mais especial, fica eleito o fórum da Comarca de ${cidade} para todas as ações decorrentes deste contrato. A parte vencida pagará, além da multa contratual, as despesas judiciais e extrajudiciais, bem como os honorários advocatícios, desde já arbitrários em 20%. Parágrafo único – Caso a pendência seja resolvida extra-judicialmente, com intervenção de advogado, serão devidos honorários na ordem 10%.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 17ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `A eventual prorrogação, expressa ou legal da locação, abrangerá todas as obrigações constantes.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 18ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `Todas as despesas decorrentes deste contrato correrão por conta exclusiva do LOCATÁRIO.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 19ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `Ficam assegurados o LOCADOR todos os direitos e vantagens conferidos para lei em vigor ou que, na vigência e após o termino do prazo deste contrato, sejam promulgados.`
        );

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Cláusula 20ª – `, { continued: true });
      doc
        .font(`Helvetica`)
        .fontSize(12)
        .text(
          `Verificada a desocupação do imóvel, ficará o LOCATÁRIO, obrigado a ressarcirem ao LOCADOR das despesas com consertos reparos e pertences inutilizados ou extraviados causados do imóvel, independente de vistoria judicial.`
        );

      doc.moveDown();

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `Assim, justos e contratados, assinam o presente, feito em DUAS VIAS de igual teor, datilografadas somente no anverso, perante duas testemunhas.`
        );
      doc.moveDown();
      doc.text(`${cidade} - ${dataInicioContrato}.`);
      doc.moveDown();
      doc.text("LOCADORES:");
      doc.moveDown();
      doc.text("_____________________________________________");
      doc.text(`${usuarioNome}`);
      doc.moveDown(3);
      doc.text("LOCATÁRIO:");
      doc.moveDown();
      doc.text("_____________________________________________");
      doc.text(`${moradorNome}`);

      doc.end();

      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      try {
        const result = await cloudinary.uploader.upload(caminho, {
          resource_type: "raw",
          public_id: `contrato-${moradorNome.replace(/\s+/g, "_")}`,
          overwrite: true,
          flags: "attachment",
          folder: "contratos-alugai",
        });

        const url = result.secure_url;

        await Morador.update({ contrato: url }, { where: { id: moradorId } });

        return res.status(201).json({
          message: "Contrato criado com sucesso!",
          path: caminho,
          url,
        });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: "Erro ao criar o contrato", detalhes: error.message });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao criar o contrato", detalhes: error.message });
    }
  }
};
