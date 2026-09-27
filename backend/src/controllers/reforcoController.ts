import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { buscarVideos } from "../services/youtubeApi";
import type { MaterialReforco } from "../services/youtubeApi";

export async function consultarReforco(
  req: Request,
  res: Response
) {
  const desempenhoId = Number(req.params.id);
  const usuario = res.locals.usuario;

  if (!usuario) {
    res.status(401).json({
      mensagem: "Faça login para continuar.",
    });
    return;
  }

  if (!Number.isInteger(desempenhoId) || desempenhoId <= 0) {
    res.status(400).json({
      mensagem: "Informe um desempenho válido.",
    });
    return;
  }

  if (
    usuario.perfil !== "PROFESSOR" &&
    usuario.perfil !== "ALUNO"
  ) {
    res.status(403).json({
      mensagem: "Você não tem permissão para consultar materiais.",
    });
    return;
  }

  const filtro: {
    id: number;
    professorId?: number;
    alunoId?: number;
  } = {
    id: desempenhoId,
  };

  if (usuario.perfil === "PROFESSOR") {
    filtro.professorId = usuario.id;
  } else {
    filtro.alunoId = usuario.id;
  }

  try {
    const desempenho = await prisma.desempenho.findFirst({
      where: filtro,
    });

    if (!desempenho) {
      res.status(404).json({
        mensagem: "Desempenho não encontrado para sua conta.",
      });
      return;
    }

    let materiais: MaterialReforco[];

    try {
      materiais = await buscarVideos(desempenho.competencia);
    } catch (erro) {
      res.status(502).json({
        mensagem:
          erro instanceof Error
            ? erro.message
            : "Não foi possível buscar materiais de reforço.",
      });
      return;
    }

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "CONSULTAR_REFORCO_YOUTUBE",
        alvoId: desempenho.id,
      },
    });

    res.json({
      competencia: desempenho.competencia,
      materiais: materiais,
    });
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível concluir a consulta de reforço.",
    });
  }
}