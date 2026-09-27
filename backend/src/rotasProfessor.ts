import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { cadastrarProfessor } from "./controllers/professorController";

const rotasProfessor = Router();

const limiteCadastro = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensagem: "Muitas tentativas de cadastro. Aguarde 15 minutos.",
  },
});

rotasProfessor.post(
  "/professores",
  limiteCadastro,
  cadastrarProfessor
);

export default rotasProfessor;