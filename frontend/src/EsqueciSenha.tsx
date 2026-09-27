import { useState } from "react";
import type { FormEvent } from "react";

type EsqueciSenhaProps = {
  aoVoltar: () => void;
};

export default function EsqueciSenha({
  aoVoltar,
}: EsqueciSenhaProps) {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function solicitar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setMensagem("");
    setErro("");
    setEnviando(true);

    try {
      const resposta = await fetch("/api/esqueci-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.mensagem ?? "Não foi possível solicitar a recuperação."
        );
        return;
      }

      setMensagem(dados.mensagem);
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section>
      <h2>Recuperar senha</h2>

      <p>
        Informe o e-mail cadastrado para receber um link de
        recuperação de senha.
      </p>

      <form onSubmit={solicitar}>
        <fieldset disabled={enviando}>
          <legend>E-mail da conta</legend>

          <p>
            <label htmlFor="emailRecuperacao">E-mail</label>
            <input
              id="emailRecuperacao"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
            />
          </p>

          <button type="submit">
            {enviando ? "Enviando..." : "Enviar link"}
          </button>
        </fieldset>
      </form>

      {mensagem && (
        <p role="status">
          {mensagem} Confira também a caixa de spam.
        </p>
      )}

      {erro && <p role="alert">{erro}</p>}

      <p>
        <button
          type="button"
          onClick={aoVoltar}
          disabled={enviando}
        >
          Voltar ao login
        </button>
      </p>
    </section>
  );
}