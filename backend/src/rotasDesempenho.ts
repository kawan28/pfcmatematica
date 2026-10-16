import { Router } from "express";
import {
  verificarLogin,
  verificarProfessor,
  verificarSenhaDefinitiva,
  verificarTermos,
} from "./autenticacao";
import {
  listarDesempenhos,
  cadastrarDesempenho,
} from "./controllers/desempenhoController";

const rotasDesempenho = Router();

rotasDesempenho.get(
  "/desempenhos",
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
  listarDesempenhos
);

rotasDesempenho.post(
  "/desempenhos",
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
  verificarProfessor,
  cadastrarDesempenho
);

export default rotasDesempenho;
