import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

export async function cadastrarAluno(
  req: Request,
  res: Response
) {
  const { nome, email } = req.body ?? {};

  if (typeof nome !== "string" || typeof email !== "string") {
    res.status(400).json({
      mensagem: "Informe o nome e o e-mail do aluno.",
    });
    return;
  }

  const nomeFormatado = nome.trim();
  const emailFormatado = email.trim().toLowerCase();

  // Verifica um formato básico de e-mail.
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado);

  if (
    nomeFormatado === "" ||
    nomeFormatado.length > 100 ||
    !emailValido ||
    emailFormatado.length > 254
  ) {
    res.status(400).json({
      mensagem: "Informe um nome de até 100 caracteres e um e-mail válido.",
    });
    return;
  }

  try {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailFormatado },
    });

    if (usuarioExistente) {
      res.status(409).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
      return;
    }

    // Gera uma senha aleatória e salva apenas o hash no banco.
    const senhaProvisoria = randomBytes(9).toString("hex");
    const senhaHash = await bcrypt.hash(senhaProvisoria, 12);

    // Usa o professor identificado pelo token.
    const professor = res.locals.usuario;

    // Salva o aluno e o registro de auditoria juntos.
    const aluno = await prisma.$transaction(async (banco) => {
      const novoAluno = await banco.usuario.create({
        data: {
          nome: nomeFormatado,
          email: emailFormatado,
          senhaHash: senhaHash,
          perfil: "ALUNO",
          professorId: professor.id,
          trocarSenha: true,
        },
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });

      // Registra quem cadastrou e qual aluno foi criado.
      await banco.logAuditoria.create({
        data: {
          usuarioId: professor.id,
          acao: "CADASTRAR_ALUNO",
          alvoId: novoAluno.id,
        },
      });

      return novoAluno;
    });

    // A senha é apresentada ao professor nesta criação.
    res.setHeader("Cache-Control", "no-store");

    res.status(201).json({
      mensagem: "Aluno cadastrado com sucesso.",
      aluno: aluno,
      senhaProvisoria: senhaProvisoria,
    });
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível cadastrar o aluno.",
    });
  }
}

// Consulta somente os alunos do professor que está logado.
export async function listarAlunos(
  req: Request,
  res: Response
) {
  try {
    const professor = res.locals.usuario;

    const alunos = await prisma.usuario.findMany({
      where: {
        professorId: professor.id,
        perfil: "ALUNO",
        excluidoEm: null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        trocarSenha: true,
      },
      orderBy: { nome: "asc" },
    });

    res.json(alunos);
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível consultar os alunos.",
    });
  }
}

export async function redefinirSenhaAluno(
  req: Request,
  res: Response
) {
  const alunoId = Number(req.params.id);
  const professor = res.locals.usuario;

  if (!Number.isInteger(alunoId) || alunoId <= 0) {
    res.status(400).json({
      mensagem: "Identificador do aluno inválido.",
    });
    return;
  }

  try {
    const senhaProvisoria = randomBytes(9).toString("hex");
    const senhaHash = await bcrypt.hash(senhaProvisoria, 12);

    const resultado = await prisma.$transaction(async (banco) => {
      const alteracao = await banco.usuario.updateMany({
        where: {
          id: alunoId,
          perfil: "ALUNO",
          excluidoEm: null,
          professorId: professor.id,
        },
        data: {
          senhaHash: senhaHash,
          trocarSenha: true,
          versaoToken: { increment: 1 },
          recuperacaoTokenHash: null,
          recuperacaoExpiraEm: null,
        },
      });

      if (alteracao.count === 1) {
        await banco.logAuditoria.create({
          data: {
            usuarioId: professor.id,
            acao: "REDEFINIR_SENHA_ALUNO",
            alvoId: alunoId,
          },
        });
      }

      return alteracao;
    });

    if (resultado.count === 0) {
      res.status(404).json({
        mensagem: "Aluno não encontrado entre os seus alunos.",
      });
      return;
    }

    res.setHeader("Cache-Control", "no-store");

    res.json({
      mensagem: "Senha provisória gerada com sucesso.",
      senhaProvisoria: senhaProvisoria,
    });
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível redefinir a senha do aluno.",
    });
  }
}
