import { useState } from "react";
import type { FormEvent } from "react";

type CadastrarAlunoProps = {
  token: string;
  aoCadastrar?: () => void;
};

type AcessoCriado = {
  nome: string;
  email: string;
  senhaProvisoria: string;
};

export default function CadastrarAluno({
  token,
  aoCadastrar,
}: CadastrarAlunoProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [acesso, setAcesso] = useState<AcessoCriado | null>(null);

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setErro("");
    setAcesso(null);
    setSalvando(true);

    try {
      const resposta = await fetch("/api/alunos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem ?? "Não foi possível cadastrar o aluno.");
        return;
      }

      setAcesso({
        nome: dados.aluno.nome,
        email: dados.aluno.email,
        senhaProvisoria: dados.senhaProvisoria,
      });

      setNome("");
      setEmail("");
      aoCadastrar?.();
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section>
      <h2>Cadastrar aluno</h2>

      <p>
        Informe o nome e o e-mail do aluno. O sistema criará uma
        senha provisória para o primeiro acesso.
      </p>

      <form onSubmit={cadastrar}>
        <fieldset disabled={salvando}>
          <legend>Dados do aluno</legend>

          <p>
            <label htmlFor="nomeAluno">Nome</label>
            <input
              id="nomeAluno"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              maxLength={100}
              required
            />
          </p>

          <p>
            <label htmlFor="emailAluno">E-mail</label>
            <input
              id="emailAluno"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              maxLength={254}
              required
            />
          </p>

          <button type="submit">
            {salvando ? "Cadastrando..." : "Criar acesso"}
          </button>
        </fieldset>
      </form>

      {erro && <p role="alert">{erro}</p>}

      {acesso && (
        <section aria-label="Acesso criado">
          <p role="status">Aluno cadastrado com sucesso!</p>

          <p>
            <strong>Nome:</strong> {acesso.nome}
          </p>

          <p>
            <strong>E-mail:</strong> {acesso.email}
          </p>

          <p>
            <strong>Senha provisória:</strong>{" "}
            <code>{acesso.senhaProvisoria}</code>
          </p>

          <p>
            Entregue esses dados ao aluno de forma privada.
            Ele deverá trocar a senha no primeiro acesso.
            A senha provisória não é enviada automaticamente por e-mail.
          </p>

          <button type="button" onClick={() => setAcesso(null)}>
            Ocultar dados do acesso
          </button>
        </section>
      )}
    </section>
  );
}