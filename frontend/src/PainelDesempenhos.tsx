import { useEffect, useState } from "react";
import type { FormEvent } from "react";

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

export default function App() {
  const [aluno, setAluno] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [totalQuestoes, setTotalQuestoes] = useState("");
  const [acertos, setAcertos] = useState("");
  const [meta, setMeta] = useState(() => {
  return localStorage.getItem("pfc_meta") ?? "70";
});

  const [desempenhos, setDesempenhos] = useState<Desempenho[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
    
   useEffect(() => {
    const valor = Number(meta);

    if (
      meta.trim() !== "" &&
      Number.isInteger(valor) &&
      valor >= 0 &&
      valor <= 100
    ) {
      localStorage.setItem("pfc_meta", meta);
    }
  }, [meta]);


  async function carregarDesempenhos() {
    setCarregando(true);

    try {
      const resposta = await fetch("/api/desempenhos");

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar os desempenhos.");
      }

      const dados: Desempenho[] = await resposta.json();
      setDesempenhos(dados);
    } catch {
      setErro("Não foi possível carregar os registros. Confira o backend.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDesempenhos();
  }, []);

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setMensagem("");
    setErro("");

    if (!aluno.trim() || !competencia.trim()) {
      setErro("Preencha o aluno e a competência.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch("/api/desempenhos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aluno: aluno.trim(),
          competencia: competencia.trim(),
          totalQuestoes: Number(totalQuestoes),
          acertos: Number(acertos),
          meta: Number(meta),
        }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json();

        throw new Error(
          dados.mensagem ?? "Não foi possível salvar o desempenho."
        );
      }

      setMensagem("Desempenho registrado com sucesso!");
      setAluno("");
      setCompetencia("");
      setTotalQuestoes("");
      setAcertos("");

      await carregarDesempenhos();
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível conectar ao servidor."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main>
      <h1>Desempenho em Matemática</h1>
      <p>Registre os resultados e acompanhe o desempenho por competência.</p>

      <h2>Registrar desempenho</h2>

      <form onSubmit={cadastrar}>
        <fieldset disabled={salvando}>
          <legend>Dados da avaliação</legend>

          <p>
            <label htmlFor="aluno">Identificação do aluno</label>
            <br />
            <input
              id="aluno"
              value={aluno}
              onChange={(evento) => setAluno(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="competencia">Competência</label>
            <br />
            <input
              id="competencia"
              value={competencia}
              onChange={(evento) => setCompetencia(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="totalQuestoes">Total de questões</label>
            <br />
            <input
              id="totalQuestoes"
              type="number"
              min="1"
              step="1"
              value={totalQuestoes}
              onChange={(evento) => setTotalQuestoes(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="acertos">Acertos</label>
            <br />
            <input
              id="acertos"
              type="number"
              min="0"
              max={totalQuestoes === "" ? undefined : Number(totalQuestoes)}
              step="1"
              value={acertos}
              onChange={(evento) => setAcertos(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="meta">Meta (%)</label>
            <br />
            <input
              id="meta"
              type="number"
              min="0"
              max="100"
              step="1"
              value={meta}
              onChange={(evento) => setMeta(evento.target.value)}
              required
            />
          </p>

          <button type="submit">
            {salvando ? "Salvando..." : "Salvar desempenho"}
          </button>
        </fieldset>
      </form>

      {mensagem && <p role="status">{mensagem}</p>}
      {erro && <p role="alert">{erro}</p>}

      <h2>Resultados registrados</h2>

      {carregando ? (
        <p>Carregando resultados...</p>
      ) : desempenhos.length === 0 ? (
        <p>Nenhum resultado para exibir.</p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}