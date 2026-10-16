import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { verificarLogin } from "./autenticacao";
import { excluirConta } from "./controllers/contaController";

const rotasConta = Router();

const limiteExclusao = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  // Conta só as tentativas que falham, como no login.
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensagem: "Muitas tentativas de excluir a conta. Aguarde 15 minutos.",
  },
});

// Não exige troca de senha nem aceite dos termos:
// quem não aceita os termos também precisa conseguir sair.
rotasConta.delete("/conta", verificarLogin, limiteExclusao, excluirConta);

export default rotasConta;
