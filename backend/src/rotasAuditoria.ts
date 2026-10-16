import { Router } from "express";
import {
  verificarLogin,
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
  listarAuditoria
);

export default rotasAuditoria;
