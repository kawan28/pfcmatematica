import { useState } from "react";

type Log = {
  id: number;
  usuarioId: number;
  acao: string;
  alvoId: number | null;
  alvoNome: string | null;
  criadoEm: string;
};

// Textos exibidos no lugar dos códigos salvos no banco.
const descricoesAcoes: Record<string, string> = {
  LOGIN: "Entrou no sistema",
  CADASTRAR_PROFESSOR: "Criou a conta de professor",
  CADASTRAR_ALUNO: "Cadastrou um aluno",
  REDEFINIR_SENHA_ALUNO: "Gerou uma senha provisória para um aluno",
  CADASTRAR_DESEMPENHO: "Registrou um desempenho",
  CONSULTAR_DESEMPENHOS: "Consultou os desempenhos",
  CONSULTAR_REFORCO_YOUTUBE: "Consultou materiais de reforço",
  TROCAR_SENHA: "Trocou a senha",
  SOLICITAR_RECUPERACAO_SENHA: "Pediu a recuperação de senha",
  RECUPERAR_SENHA: "Recuperou a senha",
  EXCLUIR_CONTA: "Excluiu a própria conta",
};

function descreverAcao(acao: string) {
  // O código do aceite inclui a versão, por exemplo ACEITAR_TERMOS_1.0.
  if (acao.startsWith("ACEITAR_TERMOS_")) {
    const versao = acao.slice("ACEITAR_TERMOS_".length);
    return "Aceitou os termos de uso (versão " + versao + ")";
  }

  // Mostra o próprio código se surgir uma ação ainda sem descrição.
  return descricoesAcoes[acao] ?? acao;
}

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
                <th>Ação</th>
                <th>Relacionado a</th>
                <th>Data e hora</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{descreverAcao(log.acao)}</td>
                  <td>{log.alvoNome ?? "—"}</td>
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