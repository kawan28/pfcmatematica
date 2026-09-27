import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

export async function cadastrarProfessor(
  req: Request,
  res: Response
) {
  const { nome, email, senha, aceito, versao } = req.body ?? {};

  if (
    typeof nome !== "string" ||
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    res.status(400).json({
      mensagem: "Informe nome, e-mail e senha.",
    });
    return;
  }

  const nomeFormatado = nome.trim();
  const emailFormatado = email.trim().toLowerCase();

  if (nomeFormatado === "" || nomeFormatado.length > 100) {
    res.status(400).json({
      mensagem: "Informe um nome com até 100 caracteres.",
    });
    return;
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado);

  if (!emailValido || emailFormatado.length > 254) {
    res.status(400).json({
      mensagem: "Informe um e-mail válido.",
    });
    return;
  }

  if (
    senha.length < 8 ||
    Buffer.byteLength(senha, "utf8") > 72
  ) {
    res.status(400).json({
      mensagem: "Use uma senha com pelo menos 8 caracteres e até 72 bytes.",
    });
    return;
  }

  if (aceito !== true || versao !== "1.0") {
    res.status(400).json({
      mensagem: "Confirme o aceite da versão atual dos termos.",
    });
    return;
  }

  try {
    const existente = await prisma.usuario.findUnique({
      where: {
        email: emailFormatado,
      },
    });

    if (existente) {
      res.status(409).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const professor = await prisma.$transaction(async (banco) => {
      const novoProfessor = await banco.usuario.create({
        data: {
          nome: nomeFormatado,
          email: emailFormatado,
          senhaHash: senhaHash,
          perfil: "PROFESSOR",
          trocarSenha: false,
          termosAceitosEm: new Date(),
          versaoTermos: "1.0",
        },
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });

      await banco.logAuditoria.create({
        data: {
          usuarioId: novoProfessor.id,
          acao: "CADASTRAR_PROFESSOR",
          alvoId: novoProfessor.id,
        },
      });

      await banco.logAuditoria.create({
        data: {
          usuarioId: novoProfessor.id,
          acao: "ACEITAR_TERMOS_1.0",
          alvoId: novoProfessor.id,
        },
      });

      return novoProfessor;
    });

    res.status(201).json({
      mensagem: "Professor cadastrado! Faça login para continuar.",
      professor: professor,
    });
  } catch (erro) {
    if (
      erro instanceof Error &&
      "code" in erro &&
      erro.code === "P2002"
    ) {
      res.status(409).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
      return;
    }

    res.status(500).json({
      mensagem: "Não foi possível cadastrar o professor.",
    });
  }
}