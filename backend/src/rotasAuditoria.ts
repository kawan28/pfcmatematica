import { Router } from "express";
import { prisma } from "./prisma";
import {
  verificarLogin,
  verificarProfessor,
  verificarTermos,
  verificarSenhaDefinitiva,
} from "./autenticacao";

const rotasAuditoria = Router();

rotasAuditoria.get(
  "/auditoria",
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
  verificarProfessor,
  async (req, res) => {
    try {
      const professor = res.locals.usuario;

      // Cada professor consulta suas próprias ações.
      const registros = await prisma.logAuditoria.findMany({
        where: {
          usuarioId: professor.id,
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
);

export default rotasAuditoria;