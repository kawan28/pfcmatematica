import { useState } from "react";
import Login from "./Login";
import type { Usuario } from "./Login";
import TrocarSenha from "./TrocarSenha";
import Termos from "./Termos";
import EsqueciSenha from "./EsqueciSenha";
import RecuperarSenha from "./RecuperarSenha";
import ListaDesempenhos from "./ListaDesempenhos";
import CadastrarProfessor from "./CadastrarProfessor";
import PainelProfessor from "./PainelProfessor";
import LogsAuditoria from "./LogsAuditoria";
import ExcluirConta from "./ExcluirConta";


type Sessao = {
  token: string;
  usuario: Usuario;
  senhaProvisoria: string;
};

export default function App() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [aviso, setAviso] = useState(() => {
  const parametros = new URLSearchParams(window.location.search);

  if (parametros.get("senhaRecuperada") === "1") {
    return "Senha alterada com sucesso! Entre com sua nova senha.";
  }

  return "";
});
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);
  const [cadastrandoProfessor, setCadastrandoProfessor] = useState(false);
  const [linkRecuperacao, setLinkRecuperacao] = useState(() => {
  return window.location.pathname === "/recuperar-senha";
});

const [tokenRecuperacao] = useState(() => {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get("token") ?? "";
});

  const [documento, setDocumento] = useState<
    "termos" | "privacidade" | null
  >(null);

  const [aceito, setAceito] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function entrar(
    token: string,
    usuario: Usuario,
    senhaDigitada: string
  ) {
    setAviso("");
    setErro("");
    setAceito(false);

    let senhaProvisoria = "";

    if (usuario.trocarSenha) {
      senhaProvisoria = senhaDigitada;
    }

    setSessao({
      token: token,
      usuario: usuario,
      senhaProvisoria: senhaProvisoria,
    });
  }

  function sair() {
    setSessao(null);
    setAceito(false);
    setErro("");
    setAviso("");
    setDocumento(null);
  }

  async function aceitarTermos() {
    if (!sessao || salvando) {
      return;
    }

    if (!aceito) {
      setErro("Marque a confirmação de leitura e aceite.");
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/termos/aceitar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessao.token,
        },
        body: JSON.stringify({
          aceito: true,
          versao: "1.0",
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.mensagem ?? "Não foi possível registrar o aceite.");
        return;
      }

      setSessao({
        ...sessao,
        usuario: {
          ...sessao.usuario,
          termosAceitosEm: new Date().toISOString(),
          versaoTermos: dados.versao,
        },
      });

      setAviso("Aceite registrado com sucesso.");
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  let precisaAceitar = false;

  if (sessao) {
    precisaAceitar =
      !sessao.usuario.termosAceitosEm ||
      sessao.usuario.versaoTermos !== "1.0";
  }

  return (
    <main>
      <h1>Radar da Matemática</h1>

      <nav aria-label="Termos e privacidade">
  <button
    type="button"
    onClick={() => setDocumento("termos")}
  >
    Termos e Política de Privacidade
  </button>
</nav>

{documento !== null && (
  <section>
    <Termos documento="termos" />

    <hr />

    <Termos documento="privacidade" />

    <button
      type="button"
      onClick={() => setDocumento(null)}
    >
      Fechar
    </button>
  </section>
)}

      {aviso && <p role="status">{aviso}</p>}

      {linkRecuperacao ? (
  <RecuperarSenha
    token={tokenRecuperacao}
    aoVoltar={() => {
      window.history.replaceState(null, "", "/");
      setLinkRecuperacao(false);
      setRecuperandoSenha(false);
      setSessao(null);
      setAviso("");
      setErro("");
      setAceito(false);
    }}
  />

) : !sessao ? (
  cadastrandoProfessor ? (
    <CadastrarProfessor
      aoConcluir={() => {
        setCadastrandoProfessor(false);
        setRecuperandoSenha(false);
        setAviso("Conta criada com sucesso! Entre com seu e-mail e senha.");
      }}
      aoVoltar={() => {
        setCadastrandoProfessor(false);
        setAviso("");
      }}
    />
  ) : recuperandoSenha ? (
    <EsqueciSenha
      aoVoltar={() => setRecuperandoSenha(false)}
    />
  ) : (
    <>
      <Login aoEntrar={entrar} />
      <p>
  <button
    type="button"
    onClick={() => {
      setAviso("");
      setRecuperandoSenha(false);
      setCadastrandoProfessor(true);
    }}
  >
    Criar conta de professor
  </button>
</p>

      <p>
        <button
          type="button"
          onClick={() => {
            setAviso("");
            setRecuperandoSenha(true);
          }}
        >
          Esqueci minha senha
        </button>
      </p>
    </>
  )
) : (
        <>
          <h2>Olá, {sessao.usuario.nome}!</h2>

          {sessao.usuario.trocarSenha ? (
            <TrocarSenha
              token={sessao.token}
              senhaProvisoria={sessao.senhaProvisoria}
              aoConcluir={() => {
                setSessao(null);
                setAceito(false);
                setErro("");
                setAviso(
                  "Senha alterada! Entre novamente com sua nova senha."
                );
              }}
            />
          ) : precisaAceitar ? (
            <section>
              <h3>Leia os documentos para continuar</h3>

              <p>
                
                Leia os documentos pelo botão “Termos e Política de
                Privacidade” acima. Depois, confirme abaixo.
                
              </p>

              <label>
                <input
                  type="checkbox"
                  checked={aceito}
                  disabled={salvando}
                  onChange={(evento) => {
                    setAceito(evento.target.checked);
                  }}
                  style={{ width: "auto", marginRight: "8px" }}
                />
                Li e aceito o Termo de Aceite e declaro ter lido
                a Política de Privacidade.
              </label>

              <p>
                <button
                  type="button"
                  disabled={!aceito || salvando}
                  onClick={aceitarTermos}
                >
                  {salvando ? "Salvando..." : "Aceitar e continuar"}
                </button>
              </p>

              {erro && <p role="alert">{erro}</p>}
            </section>
          ) : (
            <section>
          {sessao.usuario.perfil === "PROFESSOR" ? (
          <PainelProfessor token={sessao.token} />
        ) : (
          <>
            <ListaDesempenhos token={sessao.token} />
            <LogsAuditoria token={sessao.token} />
          </>
    )}

            </section>
          )}

          <ExcluirConta
            token={sessao.token}
            perfil={sessao.usuario.perfil}
            aoExcluir={() => {
              sair();
              setAviso("Sua conta foi excluída e seus dados pessoais foram removidos.");
            }}
          />

          <p>
            <button
              type="button"
              onClick={sair}
              disabled={salvando}
            >
              Sair
            </button>
          </p>
        </>
      )}
    </main>
  );
}