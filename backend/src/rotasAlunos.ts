import { Router } from "express";
import {
  verificarLogin,
  verificarProfessor,
  verificarSenhaDefinitiva,
  verificarTermos,
} from "./autenticacao";
import {
  cadastrarAluno,
  listarAlunos,
  redefinirSenhaAluno,
} from "./controllers/alunoController";

const rotasAlunos = Router();

rotasAlunos.post(
  "/alunos",
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
  verificarProfessor,
  cadastrarAluno
);

rotasAlunos.get(
  "/alunos",
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
  verificarProfessor,
  listarAlunos
);

rotasAlunos.post(
  "/alunos/:id/redefinir-senha",
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
  verificarProfessor,
  redefinirSenhaAluno
);

export default rotasAlunos;
