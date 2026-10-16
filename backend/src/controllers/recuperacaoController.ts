import "dotenv/config";
import type { Request, Response } from "express";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { enviarEmail } from "../email";

const enderecoFrontend = process.env.FRONTEND_URL;

if (!enderecoFrontend) {
  throw new Error("Configure FRONTEND_URL no .env.");
}

export async function solicitarRecuperacao(
  req: Request,
  res: Response
) {
  const { email } = req.body ?? {};

  if (typeof email !== "string") {
    res.status(400).json({
      mensagem: "Informe o e-mail.",
    });
    return;
  }

  const emailFormatado = email.trim().toLowerCase();
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado);

  if (!emailValido || emailFormatado.length > 254) {
    res.status(400).json({
      mensagem: "Informe um e-mail válido.",
    });
    return;
  }

  const mensagem = "Se o e-mail estiver cadastrado, você receberá um link de recuperação.";

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email: emailFormatado },
    });

    if (!usuario || usuario.excluidoEm) {
      res.json({ mensagem: mensagem });
      return;
    }

    const token = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const expiraEm = new Date(Date.now() + 15 * 60 * 1000);

    const link = new URL("/recuperar-senha", enderecoFrontend);
    link.searchParams.set("token", token);

    const resultado = await prisma.$transaction(async (banco) => {
      const alteracao = await banco.usuario.updateMany({
        where: {
          id: usuario.id,
          versaoToken: usuario.versaoToken,
          recuperacaoTokenHash: usuario.recuperacaoTokenHash,
        },
        data: {
          recuperacaoTokenHash: tokenHash,
          recuperacaoExpiraEm: expiraEm,
        },
      });

      if (alteracao.count === 1) {
        await banco.logAuditoria.create({
          data: {
            usuarioId: usuario.id,
            acao: "SOLICITAR_RECUPERACAO_SENHA",
            alvoId: usuario.id,
          },
        });
      }

      return alteracao;
    });

    if (resultado.count === 0) {
      res.json({ mensagem: mensagem });
      return;
    }

    try {
      await enviarEmail(
        usuario.email,
        "Recuperação de senha — Radar da Matemática",
        "Recebemos uma solicitação de recuperação de senha.\n\n" +
        "Abra este link para definir uma nova senha:\n" +
        link.toString() +
        "\n\nO link expira em 15 minutos." +
        "\nSe você não fez essa solicitação, ignore este e-mail."
      );
    } catch {
      await prisma.usuario.updateMany({
        where: {
          id: usuario.id,
          recuperacaoTokenHash: tokenHash,
        },
        data: {
          recuperacaoTokenHash: null,
          recuperacaoExpiraEm: null,
        },
      });

      console.error("Falha no envio do e-mail de recuperação.");
    }

    res.json({ mensagem: mensagem });
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível processar a recuperação.",
    });
  }
}

export async function recuperarSenha(
  req: Request,
  res: Response
) {
  const { token, novaSenha } = req.body ?? {};

  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/.test(token)
  ) {
    res.status(400).json({
      mensagem: "Link inválido ou expirado.",
    });
    return;
  }

  if (
    typeof novaSenha !== "string" ||
    novaSenha.length < 8 ||
    Buffer.byteLength(novaSenha, "utf8") > 72
  ) {
    res.status(400).json({
      mensagem: "Use uma senha com pelo menos 8 caracteres e até 72 bytes.",
    });
    return;
  }

  try {
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const usuario = await prisma.usuario.findUnique({
      where: {
        recuperacaoTokenHash: tokenHash,
      },
    });

    if (
      !usuario ||
      !usuario.recuperacaoExpiraEm ||
      usuario.recuperacaoExpiraEm <= new Date()
    ) {
      res.status(400).json({
        mensagem: "Link inválido ou expirado.",
      });
      return;
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);

    const resultado = await prisma.$transaction(async (banco) => {
      const alteracao = await banco.usuario.updateMany({
        where: {
          id: usuario.id,
          recuperacaoTokenHash: tokenHash,
          recuperacaoExpiraEm: {
            gt: new Date(),
          },
          versaoToken: usuario.versaoToken,
        },
        data: {
          senhaHash: senhaHash,
          trocarSenha: false,
          versaoToken: { increment: 1 },
          recuperacaoTokenHash: null,
          recuperacaoExpiraEm: null,
        },
      });

      if (alteracao.count === 1) {
        await banco.logAuditoria.create({
          data: {
            usuarioId: usuario.id,
            acao: "RECUPERAR_SENHA",
            alvoId: usuario.id,
          },
        });
      }

      return alteracao;
    });

    if (resultado.count === 0) {
      res.status(400).json({
        mensagem: "Link inválido ou expirado.",
      });
      return;
    }

    res.json({
      mensagem: "Senha recuperada. Faça login com a nova senha.",
    });
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível recuperar a senha.",
    });
  }
}
