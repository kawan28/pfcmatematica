import { useEffect, useState } from "react";
import MaterialReforco from "./MaterialReforco";

type Desempenho = {
  id: number;
  aluno: string;
  competencia: string;
  totalQuestoes: number;
  acertos: number;
  meta: number;
  percentual: number;
  classificacao: string;
};

type ListaDesempenhosProps = {
  token: string;
};

export default function ListaDesempenhos({
  token,
}: ListaDesempenhosProps) {
  const [desempenhos, setDesempenhos] = useState<Desempenho[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    const controle = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch("/api/desempenhos", {
          headers: {
            Authorization: "Bearer " + token,
          },
          signal: controle.signal,
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.mensagem ?? "Não foi possível consultar os resultados."
          );
        }

        if (!controle.signal.aborted) {
          setDesempenhos(dados);
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
  }, [token, atualizacao]);

  return (
    <section>
      <h2>Resultados registrados</h2>

      <button
        type="button"
        disabled={carregando}
        onClick={() => setAtualizacao(atualizacao + 1)}
      >
        {carregando ? "Carregando..." : "Atualizar resultados"}
      </button>

      {carregando ? (
        <p>Buscando resultados...</p>
      ) : erro ? (
        <p role="alert">{erro}</p>
      ) : desempenhos.length === 0 ? (
        <p>Nenhum resultado registrado para exibir.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Competência</th>
                <th>Acertos / Total</th>
                <th>Percentual</th>
                <th>Meta</th>
                <th>Classificação</th>
                <th>Material de reforço</th>
              </tr>
            </thead>

            <tbody>
              {desempenhos.map((desempenho) => (
                <tr key={desempenho.id}>
                  <td>{desempenho.aluno}</td>
                  <td>{desempenho.competencia}</td>
                  <td>
                    {desempenho.acertos} / {desempenho.totalQuestoes}
                  </td>
                  <td>{desempenho.percentual}%</td>
                  <td>{desempenho.meta}%</td>
                  <td>{desempenho.classificacao}</td>
                  <td>
                    <MaterialReforco
                      token={token}
                      desempenhoId={desempenho.id}
                    />
                  </td>
                </tr>
              
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}