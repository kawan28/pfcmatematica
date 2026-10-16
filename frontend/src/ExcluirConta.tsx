import { useState } from "react";
import type { FormEvent } from "react";

type ExcluirContaProps = {
  token: string;
  perfil: "PROFESSOR" | "ALUNO";
  aoExcluir: () => void;
};

export default function ExcluirConta({
  token,
  perfil,
  aoExcluir,
}: ExcluirContaProps) {
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function fechar() {
    setAberto(false);
    setSenha("");
    setErro("");
  }

  async function excluir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/conta", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ senha: senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem ?? "Não foi possível excluir a conta.");
        return;
      }

      aoExcluir();
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <p>
        <button type="button" onClick={() => setAberto(true)}>
          Excluir minha conta
        </button>
      </p>
    );
  }

  return (
    <section>
      <h2>Excluir minha conta</h2>

      <form onSubmit={excluir}>
        <fieldset disabled={salvando}>
          <legend>Confirmação</legend>

          <p style={{ gridColumn: "1 / -1" }}>
            Seu nome e seu e-mail serão removidos e você não conseguirá
            mais entrar.{" "}
            {perfil === "PROFESSOR"
              ? "A conta só pode ser excluída quando você não tiver mais alunos ativos."
              : "Seus resultados continuam nas estatísticas do professor, sem o seu nome."}{" "}
            Esta ação não pode ser desfeita.
          </p>

          <p>
            <label htmlFor="senhaExclusaoConta">
              Sua senha, para confirmar
            </label>
            <input
              id="senhaExclusaoConta"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              required
            />
          </p>

          <p style={{ gridColumn: "1 / -1" }}>
            <button type="submit">
              {salvando ? "Excluindo..." : "Excluir minha conta"}
            </button>{" "}
            <button type="button" onClick={fechar}>
              Cancelar
            </button>
          </p>
        </fieldset>
      </form>

      {erro && <p role="alert">{erro}</p>}
    </section>
  );
}
