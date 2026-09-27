import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

// Lê a chave que você salvou no arquivo .env.
const chave = process.env.JWT_SECRET;

if (!chave) {
  throw new Error("Defina JWT_SECRET no arquivo .env.");
}

export const chaveJwt = chave;

// Confere o token antes de permitir acesso a uma rota.
export async function verificarLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !autorizacao.startsWith("Bearer ")) {
    res.status(401).json({ mensagem: "Faça login para continuar." });
    return;
  }

  const token = autorizacao.slice(7);

  let usuarioId: number;
  let versaoToken: number;

  try {
    const dados = jwt.verify(token, chaveJwt, {
      algorithms: ["HS256"],
    });

    if (typeof dados === "string" || !dados.sub) {
      res.status(401).json({ mensagem: "Token inválido." });
      return;
    }
    // Tokens sem uma versão válida exigem um novo login.
if (
  typeof dados.versaoToken !== "number" ||
  !Number.isInteger(dados.versaoToken) ||
  dados.versaoToken < 0
) {
  res.status(401).json({
    mensagem: "Faça login novamente.",
  });
  return;
}

versaoToken = dados.versaoToken;

    usuarioId = Number(dados.sub);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      res.status(401).json({ mensagem: "Token inválido." });
      return;
    }
  } catch {
    res.status(401).json({
      mensagem: "Login inválido ou expirado. Entre novamente.",
    });
    return;
  }

  try {
    // Busca o perfil atual no banco, sem trazer a senha.
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        versaoToken: true,
        trocarSenha: true,
        termosAceitosEm: true,
        versaoTermos: true,
      },
    });

    if (!usuario) {
      res.status(401).json({ mensagem: "Usuário não encontrado." });
      return;
    }
    // Bloqueia tokens de uma versão anterior do acesso.
if (versaoToken !== usuario.versaoToken) {
  res.status(401).json({
    mensagem: "Seu acesso foi encerrado. Faça login novamente.",
  });
  return;
}

    // Disponibiliza o usuário para a próxima função.
    res.locals.usuario = usuario;
    next();
  } catch {
    res.status(500).json({
      mensagem: "Não foi possível verificar o usuário.",
    });
  }
}

// Deve ser usada depois de verificarLogin.
export function verificarProfessor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const usuario = res.locals.usuario;

  if (!usuario || usuario.perfil !== "PROFESSOR") {
    res.status(403).json({
      mensagem: "Esta função é exclusiva do professor.",
    });
    return;
  }

  next();
}
// Bloqueia as funções do sistema enquanto a senha for provisória.
export function verificarSenhaDefinitiva(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const usuario = res.locals.usuario;

  if (!usuario) {
    res.status(401).json({
      mensagem: "Faça login para continuar.",
    });
    return;
  }

  if (usuario.trocarSenha) {
    res.status(403).json({
      codigo: "TROCA_SENHA_OBRIGATORIA",
      mensagem: "Troque sua senha provisória para continuar.",
    });
    return;
  }

  next();
}

export function verificarTermos(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const usuario = res.locals.usuario;

  if (!usuario) {
    res.status(401).json({
      mensagem: "Faça login para continuar.",
    });
    return;
  }

  if (
    !usuario.termosAceitosEm ||
    usuario.versaoTermos !== "1.0"
  ) {
    res.status(403).json({
      codigo: "ACEITE_TERMOS_OBRIGATORIO",
      mensagem: "Leia e aceite os termos para continuar.",
    });
    return;
  }

  next();
}