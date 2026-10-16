import type { Request, Response } from "express";
import { prisma } from "../prisma";

// Ações em que o alvoId é o id de um desempenho, e não de um usuário.
const acoesComDesempenho = [
  "CADASTRAR_DESEMPENHO",
  "CONSULTAR_REFORCO_YOUTUBE",
];

export async function listarAuditoria(
  req: Request,
  res: Response
) {
  try {
    const usuario = res.locals.usuario;

    // Professores e alunos consultam somente as próprias ações.
    const registros = await prisma.logAuditoria.findMany({
      where: {
        usuarioId: usuario.id,
      },
      orderBy: [
        { criadoEm: "desc" },
        { id: "desc" },
      ],
      take: 100,
    });

    // Separa os alvos que são desempenhos dos que são usuários.
    const idsDesempenhos: number[] = [];
    const idsUsuarios: number[] = [];

    for (const registro of registros) {
      if (registro.alvoId === null) {
        continue;
      }

      if (acoesComDesempenho.includes(registro.acao)) {
        idsDesempenhos.push(registro.alvoId);
      } else {
        idsUsuarios.push(registro.alvoId);
      }
    }

    // Busca os nomes de uma vez, em vez de uma consulta por registro.
    const usuarios = await prisma.usuario.findMany({
      where: { id: { in: idsUsuarios } },
      select: { id: true, nome: true },
    });

    const desempenhos = await prisma.desempenho.findMany({
      where: { id: { in: idsDesempenhos } },
      select: { id: true, aluno: true },
    });

    const nomesUsuarios = new Map(
      usuarios.map((alvo) => [alvo.id, alvo.nome])
    );

    const nomesAlunosDesempenhos = new Map(
      desempenhos.map((desempenho) => [desempenho.id, desempenho.aluno])
    );

    res.json(
      registros.map((registro) => {
        let alvoNome: string | null = null;

        if (registro.alvoId !== null) {
          alvoNome = acoesComDesempenho.includes(registro.acao)
            ? nomesAlunosDesempenhos.get(registro.alvoId) ?? null
            : nomesUsuarios.get(registro.alvoId) ?? null;
        }

        return {
          ...registro,
          alvoNome: alvoNome,
        };
      })
    );
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível consultar os logs.",
    });
  }
}
