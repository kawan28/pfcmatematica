import { Router } from "express";
import {
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
} from "./autenticacao";
import { consultarReforco } from "./controllers/reforcoController";

const rotasReforco = Router();

rotasReforco.get(
  "/desempenhos/:id/reforco",
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
  consultarReforco
);

export default rotasReforco;