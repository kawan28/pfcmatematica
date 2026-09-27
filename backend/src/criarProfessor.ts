import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Permite fazer perguntas pelo terminal.
const terminal = createInterface({
  input: stdin,
  output: stdout,
});

async function criarProfessor() {
  try {
    const nome = (await terminal.question("Nome do professor: ")).trim();
    const email = (
      await terminal.question("E-mail do professor: ")
    ).trim().toLowerCase();

    const senha = await terminal.question("Senha de teste: ");

    if (nome === "" || !email.includes("@")) {
      console.log("Preencha o nome e um e-mail válido.");
      return;
    }

    // O bcrypt aceita senhas de até 72 bytes.
    if (senha.length < 8 || Buffer.byteLength(senha, "utf8") > 72) {
      console.log("Use uma senha com pelo menos 8 caracteres e até 72 bytes.");
      return;
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: email },
    });

    if (usuarioExistente) {
      console.log("Já existe uma conta com esse e-mail.");
      return;
    }

    // Protege a senha antes de salvar.
    const senhaHash = await bcrypt.hash(senha, 12);

    await prisma.usuario.create({
      data: {
        nome: nome,
        email: email,
        senhaHash: senhaHash,
        perfil: "PROFESSOR",
      },
    });

    console.log("Professor criado com sucesso!");
  } catch {
    console.log("Não foi possível criar o professor. Confira a conexão com o banco.");
  } finally {
    terminal.close();
    await prisma.$disconnect();
  }
}

criarProfessor();