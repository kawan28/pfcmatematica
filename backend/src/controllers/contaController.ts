import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import {
  anonimizarUsuario,
  gerarSenhaDescartavel,
} from "../services/exclusaoConta";

// Exclui a conta do usuário logado, anonimizando os dados pessoais.
export async function excluirConta(
  req: Request,
  res: Response
) {
  const { senha } = req.body ?? {};

  if (typeof senha !== "string" || senha === "") {
    res.status(400).json({
      mensagem: "Informe sua senha para confirmar a exclusão.",
    });
    return;
  }

  try {
    const usuarioLogado = res.locals.usuario;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioLogado.id },
    });

    if (!usuario || usuario.excluidoEm) {
      res.status(401).json({
        mensagem: "Faça login novamente.",
      });
      return;
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senhaHash
    );

    if (!senhaCorreta) {
      res.status(400).json({
        mensagem: "A senha está incorreta.",
      });
      return;
    }

    const senhaHash = await gerarSenhaDescartavel();

    const resultado = await prisma.$transaction(async (banco) => {
      // O professor só pode sair quando não tiver alunos ativos.
      if (usuario.perfil === "PROFESSOR") {
        const alunosAtivos = await banco.usuario.count({
          where: {
            professorId: usuario.id,
            excluidoEm: null,
          },
        });

        if (alunosAtivos > 0) {
          return "bloqueado";
        }
      }

      const excluido = await anonimizarUsuario(
        banco,
        usuario,
        senhaHash,
        { versaoToken: usuario.versaoToken }
      );

      if (!excluido) {
        return "alterado";
      }

      await banco.logAuditoria.create({
        data: {
          usuarioId: usuario.id,
          acao: "EXCLUIR_CONTA",
          alvoId: usuario.id,
        },
      });

      return "excluido";
    });

    if (resultado === "bloqueado") {
      res.status(409).json({
        mensagem:
          "Você ainda tem alunos vinculados. A conta só pode ser excluída quando não houver alunos ativos.",
      });
      return;
    }

    if (resultado === "alterado") {
      res.status(401).json({
        mensagem: "Seu acesso foi alterado. Faça login novamente.",
      });
      return;
    }

    res.json({
      mensagem: "Conta excluída. Seus dados pessoais foram removidos.",
    });
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível excluir a conta.",
    });
  }
}
