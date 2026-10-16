import { Router } from "express";
import {
  verificarLogin,
  verificarProfessor,
  verificarTermos,
  verificarSenhaDefinitiva,
} from "./autenticacao";
import { listarAuditoria } from "./controllers/auditoriaController";

const rotasAuditoria = Router();

rotasAuditoria.get(
  "/auditoria",
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
  verificarProfessor,
  listarAuditoria
);

export default rotasAuditoria;
