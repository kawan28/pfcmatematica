import type { Request, Response } from "express";
import { prisma } from "../prisma";

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

    res.json(registros);
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível consultar os logs.",
    });
  }
}
