import { Router } from "express";
import { prisma } from "./prisma";
import {
  verificarLogin,
  verificarSenhaDefinitiva,
} from "./autenticacao";

const rotasTermos = Router();

const versaoAtual = "1.0";

rotasTermos.post(
  "/termos/aceitar",
  verificarLogin,
  verificarSenhaDefinitiva,
  async (req, res) => {
    const { aceito, versao } = req.body ?? {};

    if (aceito !== true || versao !== versaoAtual) {
      res.status(400).json({
        mensagem: "Confirme o aceite da versão atual dos termos.",
      });
      return;
    }

    const usuario = res.locals.usuario;

    try {
      const resultado = await prisma.$transaction(async (banco) => {
        const alteracao = await banco.usuario.updateMany({
          where: {
            id: usuario.id,
            OR: [
              { termosAceitosEm: null },
              { versaoTermos: null },
              { versaoTermos: { not: versaoAtual } },
            ],
          },
          data: {
            termosAceitosEm: new Date(),
            versaoTermos: versaoAtual,
          },
        });

        if (alteracao.count === 1) {
          await banco.logAuditoria.create({
            data: {
              usuarioId: usuario.id,
              acao: "ACEITAR_TERMOS_" + versaoAtual,
              alvoId: usuario.id,
            },
          });
        }

        return alteracao;
      });

      if (resultado.count === 0) {
        res.json({
          mensagem: "Você já aceitou esta versão dos termos.",
          versao: versaoAtual,
        });
        return;
      }

      res.json({
        mensagem: "Aceite dos termos registrado com sucesso.",
        versao: versaoAtual,
      });
    } catch {
      res.status(500).json({
        mensagem: "Não foi possível registrar o aceite.",
      });
    }
  }
);

export default rotasTermos;