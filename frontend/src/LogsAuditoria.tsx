import { useState } from "react";

type Log = {
  id: number;
  usuarioId: number;
  acao: string;
  alvoId: number | null;
  criadoEm: string;
};

type LogsAuditoriaProps = {
  token: string;
};

export default function LogsAuditoria({
  token,
}: LogsAuditoriaProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [consultado, setConsultado] = useState(false);
  const [erro, setErro] = useState("");

  async function consultarLogs() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/auditoria", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem ?? "Não foi possível consultar os logs.");
        return;
      }

      setLogs(dados);
      setConsultado(true);
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section>
      <h2>Logs de auditoria</h2>
      <p>Consulte suas últimas 100 ações registradas no sistema.</p>

      <button
        type="button"
        onClick={consultarLogs}
        disabled={carregando}
      >
        {carregando ? "Consultando..." : "Consultar ou atualizar logs"}
      </button>

      {erro ? (
        <p role="alert">{erro}</p>
      ) : consultado && logs.length === 0 ? (
        <p>Nenhum registro encontrado.</p>
      ) : consultado ? (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Registro</th>
                <th>Ação</th>
                <th>ID relacionado</th>
                <th>Data e hora</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.acao}</td>
                  <td>{log.alvoId ?? "—"}</td>
                  <td>
                    {new Date(log.criadoEm).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}