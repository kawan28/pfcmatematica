import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

export async function trocarSenha(
  req: Request,
  res: Response
) {
  const { senhaAtual, novaSenha } = req.body ?? {};

  if (
    typeof senhaAtual !== "string" ||
    typeof novaSenha !== "string"
  ) {
    res.status(400).json({
      mensagem: "Informe a senha atual e a nova senha.",
    });
    return;
  }

  if (
    novaSenha.length < 8 ||
    Buffer.byteLength(novaSenha, "utf8") > 72
  ) {
    res.status(400).json({
      mensagem: "A nova senha deve ter pelo menos 8 caracteres e até 72 bytes.",
    });
    return;
  }

  if (senhaAtual === novaSenha) {
    res.status(400).json({
      mensagem: "Escolha uma senha diferente da atual.",
    });
    return;
  }

  try {
    // O usuário só pode trocar a própria senha.
    const usuarioLogado = res.locals.usuario;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioLogado.id },
    });

    if (!usuario) {
      res.status(401).json({
        mensagem: "Faça login novamente.",
      });
      return;
    }

    const senhaCorreta = await bcrypt.compare(
      senhaAtual,
      usuario.senhaHash
    );

    if (!senhaCorreta) {
      res.status(400).json({
        mensagem: "A senha atual está incorreta.",
      });
      return;
    }

    const novoHash = await bcrypt.hash(novaSenha, 12);

    const resultado = await prisma.$transaction(async (banco) => {
      const alteracao = await banco.usuario.updateMany({
        where: {
          id: usuarioLogado.id,
          versaoToken: usuarioLogado.versaoToken,
        },
        data: {
          senhaHash: novoHash,
          trocarSenha: false,
          versaoToken: { increment: 1 },
          recuperacaoTokenHash: null,
          recuperacaoExpiraEm: null,
        },
      });

      if (alteracao.count === 1) {
        await banco.logAuditoria.create({
          data: {
            usuarioId: usuarioLogado.id,
            acao: "TROCAR_SENHA",
            alvoId: usuarioLogado.id,
          },
        });
      }

      return alteracao;
    });

    if (resultado.count === 0) {
      res.status(401).json({
        mensagem: "Seu acesso foi alterado. Faça login novamente.",
      });
      return;
    }

    res.json({
      mensagem: "Senha alterada. Faça login com a nova senha.",
    });
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível alterar a senha.",
    });
  }
}
