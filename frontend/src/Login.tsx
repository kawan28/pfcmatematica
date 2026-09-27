import { useState } from "react";
import type { FormEvent } from "react";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: "PROFESSOR" | "ALUNO";
  trocarSenha: boolean;
  termosAceitosEm: string | null;
  versaoTermos: string | null;
};

type LoginProps = {
  aoEntrar: (
    token: string,
    usuario: Usuario,
    senhaDigitada: string
  ) => void;
};
export default function Login({ aoEntrar }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setErro("");
    setEntrando(true);

    try {
      const resposta = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          senha: senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem ?? "Não foi possível entrar.");
        return;
      }

      aoEntrar(dados.token, dados.usuario, senha);
    } catch {
      setErro(
        "Não foi possível conectar ao servidor. Confira se o backend está ligado."
      );
    } finally {
      setEntrando(false);
    }
  }

  return (
    <section>
      <h2>Entrar</h2>
      <p>Use o e-mail e a senha do seu cadastro.</p>

      <form onSubmit={entrar}>
        <fieldset disabled={entrando}>
          <legend>Dados de acesso</legend>

          <p>
            <label htmlFor="emailLogin">E-mail</label>
            <input
              id="emailLogin"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="senhaLogin">Senha</label>
            <input
              id="senhaLogin"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              required
            />
          </p>

          <button type="submit">
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </fieldset>
      </form>

      {erro && <p role="alert">{erro}</p>}
    </section>
  );
}