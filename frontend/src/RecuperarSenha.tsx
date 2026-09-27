import { useState } from "react";
import type { FormEvent } from "react";

type RecuperarSenhaProps = {
  token: string;
  aoVoltar: () => void;
};

export default function RecuperarSenha({
  token,
  aoVoltar,
}: RecuperarSenhaProps) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  

  async function recuperar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");

    if (novaSenha !== confirmacao) {
      setErro("A nova senha e a confirmação precisam ser iguais.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch("/api/recuperar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          novaSenha: novaSenha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem ?? "Não foi possível recuperar a senha.");
        return;
      }

      setNovaSenha("");
      setConfirmacao("");
      window.location.replace("/?senhaRecuperada=1");
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  if (!token) {
    return (
      <section>
        <h2>Link inválido</h2>

        <p role="alert">
          Volte ao login e solicite outro link em “Esqueci minha senha”.
        </p>

        <button type="button" onClick={aoVoltar}>
          Voltar ao login
        </button>
      </section>
    );
  }

  return (
    <section>
      <h2>Escolha uma nova senha</h2>
      <p>Use pelo menos 8 caracteres.</p>

      <form onSubmit={recuperar}>
        <fieldset disabled={salvando}>
          <legend>Nova senha da conta</legend>

          <p>
            <label htmlFor="novaSenhaRecuperacao">Nova senha</label>
            <input
              id="novaSenhaRecuperacao"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={novaSenha}
              onChange={(evento) => setNovaSenha(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="confirmacaoRecuperacao">
              Repita a nova senha
            </label>
            <input
              id="confirmacaoRecuperacao"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmacao}
              onChange={(evento) => setConfirmacao(evento.target.value)}
              required
            />
          </p>

          <button type="submit">
            {salvando ? "Salvando..." : "Salvar nova senha"}
          </button>
        </fieldset>
      </form>

      {erro && <p role="alert">{erro}</p>}

      <p>
        <button
          type="button"
          onClick={aoVoltar}
          disabled={salvando}
        >
          Voltar ao login
        </button>
      </p>
    </section>
  );
}