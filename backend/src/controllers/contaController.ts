import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

// Exclui a conta do usuário logado, trocando os dados pessoais por
// valores sem identificação. A linha é mantida para os logs continuarem válidos.
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

    // Ninguém consegue entrar com uma senha aleatória descartada.
    const senhaHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);

    const nomeAnonimo =
      usuario.perfil === "PROFESSOR" ? "Professor removido" : "Aluno removido";

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
          return { bloqueado: true, alteracao: null };
        }
      }

      const alteracao = await banco.usuario.updateMany({
        where: {
          id: usuario.id,
          versaoToken: usuario.versaoToken,
          excluidoEm: null,
        },
        data: {
          nome: nomeAnonimo,
          // Libera o e-mail original e mantém o campo único.
          email: "removido-" + usuario.id + "@excluido.invalid",
          senhaHash: senhaHash,
          trocarSenha: false,
          versaoToken: { increment: 1 },
          recuperacaoTokenHash: null,
          recuperacaoExpiraEm: null,
          excluidoEm: new Date(),
        },
      });

      if (alteracao.count === 1) {
        // O desempenho guarda uma cópia do nome do aluno.
        if (usuario.perfil === "ALUNO") {
          await banco.desempenho.updateMany({
            where: { alunoId: usuario.id },
            data: { aluno: nomeAnonimo },
          });
        }

        await banco.logAuditoria.create({
          data: {
            usuarioId: usuario.id,
            acao: "EXCLUIR_CONTA",
            alvoId: usuario.id,
          },
        });
      }

      return { bloqueado: false, alteracao };
    });

    if (resultado.bloqueado) {
      res.status(409).json({
        mensagem:
          "Você ainda tem alunos vinculados. A conta só pode ser excluída quando não houver alunos ativos.",
      });
      return;
    }

    if (!resultado.alteracao || resultado.alteracao.count === 0) {
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
