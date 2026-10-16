import { Router } from "express";
import { rateLimit } from "express-rate-limit";
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
  excluirAluno,
} from "./controllers/alunoController";

const rotasAlunos = Router();

const limiteExclusao = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  // Conta só as tentativas que falham, como no login.
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensagem: "Muitas tentativas de excluir alunos. Aguarde 15 minutos.",
  },
});

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

rotasAlunos.delete(
  "/alunos/:id",
  verificarLogin,
  verificarSenhaDefinitiva,
  verificarTermos,
  verificarProfessor,
  limiteExclusao,
  excluirAluno
);

export default rotasAlunos;
