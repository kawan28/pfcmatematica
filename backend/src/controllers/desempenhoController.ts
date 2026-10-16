import type { Request, Response } from "express";
import { prisma } from "../prisma";

function analisarDesempenho(dados: {
  acertos: number;
  totalQuestoes: number;
  meta: number;
}) {
  const percentual = (dados.acertos / dados.totalQuestoes) * 100;

  return {
    percentual: Number(percentual.toFixed(2)),
    classificacao:
      percentual >= dados.meta ? "Meta atingida" : "Abaixo da meta",
  };
}

export async function listarDesempenhos(
  req: Request,
  res: Response
) {
  const usuario = res.locals.usuario;

  let filtro: {
    professorId?: number;
    alunoId?: number;
  };

  if (usuario.perfil === "PROFESSOR") {
    filtro = { professorId: usuario.id };
  } else if (usuario.perfil === "ALUNO") {
    filtro = { alunoId: usuario.id };
  } else {
    res.status(403).json({
      mensagem: "Você não tem permissão para consultar desempenhos.",
    });
    return;
  }

  try {
    const desempenhos = await prisma.desempenho.findMany({
      where: filtro,
      orderBy: { criadoEm: "desc" },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "CONSULTAR_DESEMPENHOS",
      },
    });

    res.json(
      desempenhos.map((desempenho) => ({
        ...desempenho,
        ...analisarDesempenho(desempenho),
      }))
    );
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível consultar os desempenhos.",
    });
  }
}

export async function cadastrarDesempenho(
  req: Request,
  res: Response
) {
  const { alunoId, competencia, totalQuestoes, acertos, meta } =
    req.body ?? {};

  if (!Number.isInteger(alunoId) || alunoId <= 0) {
    res.status(400).json({
      mensagem: "Selecione um aluno válido.",
    });
    return;
  }

  if (
    typeof competencia !== "string" ||
    competencia.trim() === "" ||
    competencia.trim().length > 100
  ) {
    res.status(400).json({
      mensagem: "Informe uma competência com até 100 caracteres.",
    });
    return;
  }

  if (!Number.isInteger(totalQuestoes) || totalQuestoes < 1) {
    res.status(400).json({
      mensagem: "O total de questões deve ser um inteiro maior que zero.",
    });
    return;
  }

  if (
    !Number.isInteger(acertos) ||
    acertos < 0 ||
    acertos > totalQuestoes
  ) {
    res.status(400).json({
      mensagem: "Os acertos devem estar entre zero e o total de questões.",
    });
    return;
  }

  if (!Number.isInteger(meta) || meta < 0 || meta > 100) {
    res.status(400).json({
      mensagem: "A meta deve ser um inteiro entre 0 e 100.",
    });
    return;
  }

  try {
    const professor = res.locals.usuario;

    const aluno = await prisma.usuario.findFirst({
      where: {
        id: alunoId,
        perfil: "ALUNO",
        professorId: professor.id,
      },
    });

    if (!aluno) {
      res.status(404).json({
        mensagem: "Aluno não encontrado entre os seus alunos.",
      });
      return;
    }

    const desempenho = await prisma.$transaction(async (banco) => {
      const novoDesempenho = await banco.desempenho.create({
        data: {
          aluno: aluno.nome,
          alunoId: aluno.id,
          professorId: professor.id,
          competencia: competencia.trim(),
          totalQuestoes: totalQuestoes,
          acertos: acertos,
          meta: meta,
        },
      });

      await banco.logAuditoria.create({
        data: {
          usuarioId: professor.id,
          acao: "CADASTRAR_DESEMPENHO",
          alvoId: novoDesempenho.id,
        },
      });

      return novoDesempenho;
    });

    res.status(201).json({
      ...desempenho,
      ...analisarDesempenho(desempenho),
    });
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível registrar o desempenho.",
    });
  }
}
