import { Router } from "express";
import {
  verificarLogin,
  verificarSenhaDefinitiva,
} from "./autenticacao";
import { aceitarTermos } from "./controllers/termosController";

const rotasTermos = Router();

rotasTermos.post(
  "/termos/aceitar",
  verificarLogin,
  verificarSenhaDefinitiva,
  aceitarTermos
);

export default rotasTermos;
