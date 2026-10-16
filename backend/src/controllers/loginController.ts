import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { chaveJwt } from "../autenticacao";

export async function fazerLogin(
  req: Request,
  res: Response
) {
  const { email, senha } = req.body ?? {};

  // Confere se os dados recebidos são textos.
  if (typeof email !== "string" || typeof senha !== "string") {
    res.status(400).json({
      mensagem: "Informe o e-mail e a senha.",
    });
    return;
  }

  // Remove espaços do e-mail e deixa as letras minúsculas.
  const emailFormatado = email.trim().toLowerCase();

  if (emailFormatado === "" || senha === "") {
    res.status(400).json({
      mensagem: "Preencha o e-mail e a senha.",
    });
    return;
  }

  try {
    // Procura a conta pelo e-mail.
    const usuario = await prisma.usuario.findUnique({
      where: { email: emailFormatado },
    });

    if (!usuario || usuario.excluidoEm) {
      res.status(401).json({
        mensagem: "E-mail ou senha incorretos.",
      });
      return;
    }

    // Compara a senha digitada com o hash salvo no banco.
    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senhaHash
    );

    if (!senhaCorreta) {
      res.status(401).json({
        mensagem: "E-mail ou senha incorretos.",
      });
      return;
    }

    // Registra o login após conferir o e-mail e a senha.
    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "LOGIN",
      },
    });

    // Coloca no token a versão atual do acesso do usuário.
    const token = jwt.sign(
      { versaoToken: usuario.versaoToken },
      chaveJwt,
      {
        subject: String(usuario.id),
        expiresIn: "2h",
        algorithm: "HS256",
      }
    );

    // Envia apenas os dados necessários, sem a senha ou o hash.
    res.json({
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        trocarSenha: usuario.trocarSenha,
        termosAceitosEm: usuario.termosAceitosEm,
        versaoTermos: usuario.versaoTermos,
      },
    });
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível realizar o login.",
    });
  }
}
