import { useState } from "react";
import type { FormEvent } from "react";

type TrocarSenhaProps = {
  token: string;
  senhaProvisoria: string;
  aoConcluir: () => void;
};

export default function TrocarSenha({
  token,
  senhaProvisoria,
  aoConcluir,
}: TrocarSenhaProps) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function trocar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");

    if (novaSenha !== confirmacao) {
      setErro("A nova senha e a confirmação precisam ser iguais.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch("/api/trocar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          senhaAtual: senhaProvisoria,
          novaSenha: novaSenha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem ?? "Não foi possível trocar a senha.");
        return;
      }

      aoConcluir();
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section>
      <h2>Crie sua senha pessoal</h2>
      <p>Escolha uma nova senha com pelo menos 8 caracteres.</p>

      <form onSubmit={trocar}>
        <fieldset disabled={salvando}>
          <legend>Troca de senha</legend>

          <p>
            <label htmlFor="novaSenha">Nova senha</label>
            <input
              id="novaSenha"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={novaSenha}
              onChange={(evento) => setNovaSenha(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="confirmacao">Repita a nova senha</label>
            <input
              id="confirmacao"
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
    </section>
  );
}