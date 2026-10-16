import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "../generated/prisma/client";

// Gera uma senha aleatória descartada: ninguém consegue entrar com ela.
export function gerarSenhaDescartavel() {
  return bcrypt.hash(randomBytes(32).toString("hex"), 12);
}

// Troca os dados pessoais por valores sem identificação. A linha é mantida
// para os logs de auditoria continuarem apontando para um usuário existente.
// Deve ser chamada dentro de uma transação.
export async function anonimizarUsuario(
  banco: Prisma.TransactionClient,
  usuario: { id: number; perfil: "PROFESSOR" | "ALUNO" },
  senhaHash: string,
  filtro: Prisma.UsuarioWhereInput = {}
) {
  const nomeAnonimo =
    usuario.perfil === "PROFESSOR" ? "Professor removido" : "Aluno removido";

  const alteracao = await banco.usuario.updateMany({
    where: {
      ...filtro,
      id: usuario.id,
      perfil: usuario.perfil,
      excluidoEm: null,
    },
    data: {
      nome: nomeAnonimo,
      // Libera o e-mail original e mantém o campo único.
      email: "removido-" + usuario.id + "@excluido.invalid",
      senhaHash: senhaHash,
      trocarSenha: false,
      versaoToken: { increment: 1 },
      recuperacaoTokenHash: null,
      recuperacaoExpiraEm: null,
      excluidoEm: new Date(),
    },
  });

  if (alteracao.count === 1 && usuario.perfil === "ALUNO") {
    // O desempenho guarda uma cópia do nome do aluno.
    await banco.desempenho.updateMany({
      where: { alunoId: usuario.id },
      data: { aluno: nomeAnonimo },
    });
  }

  return alteracao.count === 1;
}
