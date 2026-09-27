import "dotenv/config";
import nodemailer from "nodemailer";

const usuarioEmail = process.env.EMAIL_USUARIO;
const senhaEmail = process.env.EMAIL_SENHA_APP;

if (!usuarioEmail || !senhaEmail) {
  throw new Error("Configure EMAIL_USUARIO e EMAIL_SENHA_APP no .env.");
}

const transportador = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: usuarioEmail,
    pass: senhaEmail,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
});

export async function enviarEmail(
  destinatario: string,
  assunto: string,
  texto: string
) {
  await transportador.sendMail({
    from: {
      name: "Radar da Matemática",
      address: usuarioEmail!,
    },
    to: destinatario,
    subject: assunto,
    text: texto,
  });
}