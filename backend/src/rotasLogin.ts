import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { fazerLogin } from "./controllers/loginController";

const rotasLogin = Router();

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensagem: "Muitas tentativas de login. Aguarde 15 minutos.",
  },
});

rotasLogin.post("/login", limiteLogin, fazerLogin);

export default rotasLogin;
