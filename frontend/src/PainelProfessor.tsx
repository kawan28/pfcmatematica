import { useState } from "react";
import CadastrarAluno from "./CadastrarAluno";
import ListaAlunos from "./ListaAlunos";
import RegistrarDesempenho from "./RegistrarDesempenho";
import ListaDesempenhos from "./ListaDesempenhos";
import LogsAuditoria from "./LogsAuditoria";

type PainelProfessorProps = {
  token: string;
};

export default function PainelProfessor({
  token,
}: PainelProfessorProps) {
  const [pagina, setPagina] = useState<
    "alunos" | "desempenhos" | "logs"
  >("desempenhos");
  const [versaoAlunos, setVersaoAlunos] = useState(0);

  return (
    <section>
      <nav
        aria-label="Menu do professor"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <button
          type="button"
          aria-pressed={pagina === "alunos"}
          onClick={() => setPagina("alunos")}
        >
          Alunos
        </button>

        <button
          type="button"
          aria-pressed={pagina === "desempenhos"}
          onClick={() => setPagina("desempenhos")}
        >
          Desempenhos
        </button>

        <button
          type="button"
          aria-pressed={pagina === "logs"}
          onClick={() => setPagina("logs")}
        >
          Logs
        </button>
      </nav>

      <div hidden={pagina !== "alunos"}>
        <CadastrarAluno
          token={token}
          aoCadastrar={() => setVersaoAlunos((versao) => versao + 1)}
        />
        <ListaAlunos token={token} versao={versaoAlunos} />
      </div>

      <div hidden={pagina !== "desempenhos"}>
        <RegistrarDesempenho token={token} />
        <ListaDesempenhos token={token} />
      </div>

      <div hidden={pagina !== "logs"}>
        <LogsAuditoria token={token} />
      </div>
    </section>
  );
}