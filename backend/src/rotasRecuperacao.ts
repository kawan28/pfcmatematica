import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  solicitarRecuperacao,
  recuperarSenha,
} from "./controllers/recuperacaoController";

const rotasRecuperacao = Router();

const limiteSolicitacao = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensagem: "Muitas solicitações de e-mail. Aguarde 15 minutos.",
  },
});

const limiteRedefinicao = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensagem: "Muitas tentativas de redefinir a senha. Aguarde 15 minutos.",
  },
});

rotasRecuperacao.post(
  "/esqueci-senha",
  limiteSolicitacao,
  solicitarRecuperacao
);

rotasRecuperacao.post(
  "/recuperar-senha",
  limiteRedefinicao,
  recuperarSenha
);

export default rotasRecuperacao;
