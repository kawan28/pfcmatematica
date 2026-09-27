import { useState } from "react";
import type { FormEvent } from "react";
import Termos from "./Termos";

type CadastrarProfessorProps = {
  aoConcluir: () => void;
  aoVoltar: () => void;
};

export default function CadastrarProfessor({
  aoConcluir,
  aoVoltar,
}: CadastrarProfessorProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [aceito, setAceito] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (senha !== confirmacao) {
      setErro("A senha e a confirmação precisam ser iguais.");
      return;
    }

    if (!aceito) {
      setErro("Confirme a leitura e o aceite dos termos.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch("/api/professores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          senha: senha,
          aceito: aceito,
          versao: "1.0",
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem ?? "Não foi possível realizar o cadastro.");
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
      <h2>Criar conta de professor</h2>

      <p>
        Cadastre sua conta para acompanhar seus alunos.
        Os acessos dos alunos serão criados por você.
      </p>

      <form onSubmit={cadastrar}>
        <fieldset disabled={salvando}>
          <legend>Dados do professor</legend>

          <p>
            <label htmlFor="nomeProfessor">Nome</label>
            <input
              id="nomeProfessor"
              autoComplete="name"
              maxLength={100}
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="emailProfessor">E-mail</label>
            <input
              id="emailProfessor"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="senhaProfessor">Senha</label>
            <input
              id="senhaProfessor"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="confirmacaoProfessor">
              Repita a senha
            </label>
            <input
              id="confirmacaoProfessor"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmacao}
              onChange={(evento) => setConfirmacao(evento.target.value)}
              required
            />
          </p>

          <button
            type="button"
            onClick={() => setMostrarTermos(!mostrarTermos)}
          >
            {mostrarTermos
              ? "Fechar documentos"
              : "Termos e Política de Privacidade"}
          </button>

          {mostrarTermos && (
            <div style={{ gridColumn: "1 / -1" }}>
              <Termos documento="termos" />
              <hr />
              <Termos documento="privacidade" />
            </div>
          )}

          <p style={{ gridColumn: "1 / -1" }}>
            <label>
              <input
                type="checkbox"
                checked={aceito}
                onChange={(evento) => setAceito(evento.target.checked)}
                style={{ width: "auto", marginRight: "8px" }}
                required
              />
              Li e aceito o Termo de Aceite e declaro ter lido
              a Política de Privacidade.
            </label>
          </p>

          <button type="submit">
            {salvando ? "Cadastrando..." : "Criar conta"}
          </button>
        </fieldset>
      </form>

      {erro && <p role="alert">{erro}</p>}

      <p>
        <button
          type="button"
          onClick={aoVoltar}
          disabled={salvando}
        >
          Voltar ao login
        </button>
      </p>
    </section>
  );
}