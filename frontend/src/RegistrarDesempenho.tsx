import { useState } from "react";
import type { FormEvent } from "react";

type Aluno = {
  id: number;
  nome: string;
  email: string;
};

type RegistrarDesempenhoProps = {
  token: string;
};

export default function RegistrarDesempenho({
  token,
}: RegistrarDesempenhoProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [totalQuestoes, setTotalQuestoes] = useState("");
  const [acertos, setAcertos] = useState("");

  const [meta, setMeta] = useState(() => {
    return localStorage.getItem("pfc_meta") ?? "70";
  });

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [listaCarregada, setListaCarregada] = useState(false);

  async function carregarAlunos() {
    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/alunos", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem ?? "Não foi possível carregar os alunos.");
        return;
      }

      setAlunos(dados);
      setAlunoId("");
      setListaCarregada(true);
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  async function registrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setErro("");
    setMensagem("");

    if (!alunoId || !competencia.trim()) {
      setErro("Selecione um aluno e informe a competência.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch("/api/desempenhos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          alunoId: Number(alunoId),
          competencia: competencia.trim(),
          totalQuestoes: Number(totalQuestoes),
          acertos: Number(acertos),
          meta: Number(meta),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.mensagem ?? "Não foi possível registrar o desempenho."
        );
        return;
      }

      localStorage.setItem("pfc_meta", meta);

      setMensagem(
        "Desempenho salvo! Clique em Atualizar resultados na tabela para visualizar."
      );

      setCompetencia("");
      setTotalQuestoes("");
      setAcertos("");
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section>
      <h2>Registrar desempenho</h2>

      <p>
        Carregue seus alunos e selecione quem realizou a avaliação.
      </p>

      <button
        type="button"
        onClick={carregarAlunos}
        disabled={carregando || salvando}
      >
        {carregando ? "Carregando..." : "Carregar ou atualizar alunos"}
      </button>

      {listaCarregada && alunos.length === 0 && (
        <p>
          Você ainda não possui alunos cadastrados. Cadastre um aluno
          e depois atualize esta lista.
        </p>
      )}

      {alunos.length > 0 && (
        <form onSubmit={registrar}>
          <fieldset disabled={salvando || carregando}>
            <legend>Dados da avaliação</legend>

            <p>
              <label htmlFor="alunoDesempenho">Aluno</label>
              <br />
              <select
                id="alunoDesempenho"
                value={alunoId}
                onChange={(evento) => setAlunoId(evento.target.value)}
                required
              >
                <option value="">Selecione um aluno</option>

                {alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome} — {aluno.email}
                  </option>
                ))}
              </select>
            </p>

            <p>
              <label htmlFor="competenciaDesempenho">
                Competência
              </label>
              <input
                id="competenciaDesempenho"
                value={competencia}
                onChange={(evento) => {
                  setCompetencia(evento.target.value);
                }}
                maxLength={100}
                required
              />
            </p>

            <p>
              <label htmlFor="totalDesempenho">
                Total de questões
              </label>
              <input
                id="totalDesempenho"
                type="number"
                min="1"
                step="1"
                value={totalQuestoes}
                onChange={(evento) => {
                  setTotalQuestoes(evento.target.value);
                }}
                required
              />
            </p>

            <p>
              <label htmlFor="acertosDesempenho">Acertos</label>
              <input
                id="acertosDesempenho"
                type="number"
                min="0"
                max={
                  totalQuestoes === ""
                    ? undefined
                    : Number(totalQuestoes)
                }
                step="1"
                value={acertos}
                onChange={(evento) => setAcertos(evento.target.value)}
                required
              />
            </p>

            <p>
              <label htmlFor="metaDesempenho">Meta (%)</label>
              <input
                id="metaDesempenho"
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
      )}

      {erro && <p role="alert">{erro}</p>}
      {mensagem && <p role="status">{mensagem}</p>}
    </section>
  );
}