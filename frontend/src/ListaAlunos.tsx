import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Aluno = {
  id: number;
  nome: string;
  email: string;
  trocarSenha: boolean;
};

type ListaAlunosProps = {
  token: string;
  // Muda quando um aluno é cadastrado, para recarregar a lista.
  versao: number;
};

export default function ListaAlunos({
  token,
  versao,
}: ListaAlunosProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);

  // Aluno com a confirmação de exclusão aberta.
  const [excluindo, setExcluindo] = useState<Aluno | null>(null);
  const [senha, setSenha] = useState("");
  const [erroExclusao, setErroExclusao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const controle = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch("/api/alunos", {
          headers: {
            Authorization: "Bearer " + token,
          },
          signal: controle.signal,
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem ?? "Não foi possível consultar os alunos."
          );
        }

        if (!controle.signal.aborted) {
          setAlunos(dados);
        }
      } catch (erro) {
        if (!controle.signal.aborted) {
          setErro(
            erro instanceof Error
              ? erro.message
              : "Não foi possível conectar ao servidor."
          );
        }
      } finally {
        if (!controle.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => {
      controle.abort();
    };
  }, [token, versao, atualizacao]);

  function abrirExclusao(aluno: Aluno) {
    setExcluindo(aluno);
    setSenha("");
    setErroExclusao("");
    setAviso("");
  }

  function cancelarExclusao() {
    setExcluindo(null);
    setSenha("");
    setErroExclusao("");
  }

  async function confirmarExclusao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!excluindo) {
      return;
    }

    setErroExclusao("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/alunos/" + excluindo.id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ senha: senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErroExclusao(dados.mensagem ?? "Não foi possível excluir o aluno.");
        return;
      }

      setAviso(excluindo.nome + " foi excluído(a).");
      cancelarExclusao();
      setAtualizacao(atualizacao + 1);
    } catch {
      setErroExclusao("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section>
      <h2>Meus alunos</h2>

      <button
        type="button"
        disabled={carregando}
        onClick={() => setAtualizacao(atualizacao + 1)}
      >
        {carregando ? "Carregando..." : "Atualizar lista"}
      </button>

      {aviso && <p role="status">{aviso}</p>}

      {carregando ? (
        <p>Buscando alunos...</p>
      ) : erro ? (
        <p role="alert">{erro}</p>
      ) : alunos.length === 0 ? (
        <p>Nenhum aluno cadastrado.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.nome}</td>
                  <td>{aluno.email}</td>
                  <td>
                    {aluno.trocarSenha
                      ? "Aguardando primeiro acesso"
                      : "Ativo"}
                  </td>
                  <td>
                    <button
                      type="button"
                      disabled={salvando}
                      onClick={() => abrirExclusao(aluno)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {excluindo && (
        <form onSubmit={confirmarExclusao}>
          <fieldset disabled={salvando}>
            <legend>Excluir {excluindo.nome}</legend>

            <p style={{ gridColumn: "1 / -1" }}>
              O nome e o e-mail do aluno serão removidos e ele perderá o
              acesso. Os desempenhos continuam nas estatísticas, sem o nome.
              Esta ação não pode ser desfeita.
            </p>

            <p>
              <label htmlFor="senhaExclusaoAluno">
                Sua senha, para confirmar
              </label>
              <input
                id="senhaExclusaoAluno"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                required
              />
            </p>

            <p style={{ gridColumn: "1 / -1" }}>
              <button type="submit">
                {salvando ? "Excluindo..." : "Confirmar exclusão"}
              </button>{" "}
              <button type="button" onClick={cancelarExclusao}>
                Cancelar
              </button>
            </p>
          </fieldset>

          {erroExclusao && <p role="alert">{erroExclusao}</p>}
        </form>
      )}
    </section>
  );
}
