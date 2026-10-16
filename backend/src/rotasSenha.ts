import { Router } from "express";
import { verificarLogin } from "./autenticacao";
import { trocarSenha } from "./controllers/senhaController";

const rotasSenha = Router();

rotasSenha.post("/trocar-senha", verificarLogin, trocarSenha);

export default rotasSenha;
