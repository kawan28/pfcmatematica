type TermosProps = {
  documento: "termos" | "privacidade";
};

export default function Termos({ documento }: TermosProps) {
  if (documento === "termos") {
    return (
      <article>
        <h2>Termo de Aceite</h2>
        <p>Radar da Matemática — Versão 1.0</p>

        <p>
          O sistema acompanha resultados de avaliações de matemática
          por competência, comparando os acertos com a meta definida
          pelo professor. Os resultados apoiam o acompanhamento
          pedagógico e não constituem diagnóstico de aprendizagem.
        </p>

        <p>
          O professor cadastra seus alunos e registra os resultados,
          sendo responsável pela exatidão das informações. Cada aluno
          consulta apenas seus próprios resultados.
        </p>

        <p>
          Cada usuário deve proteger sua senha. O aluno deve trocar
          a senha provisória no primeiro acesso. Não devem ser
          inseridas informações de saúde ou outros dados pessoais
          desnecessários nos campos do sistema.
        </p>

        <p>
          Ao aceitar, você concorda com estas regras e declara ter
          lido a Política de Privacidade. A data e a versão aceita
          ficam registradas, sem necessidade de repetir o aceite
          desta versão nos próximos acessos.
        </p>
      </article>
    );
  }

  return (
    <article>
      <h2>Política de Privacidade</h2>
      <p>Radar da Matemática — Versão 1.0</p>

      <h3>Dados e finalidades</h3>
      <p>
        Utilizamos nome, e-mail, identificador da conta, perfil e
        vínculo com o professor para identificar usuários e controlar
        o acesso. A senha é armazenada como hash, e não em texto.
      </p>
      <p>
        Competência, total de questões, acertos, meta e data da
        avaliação são utilizados para calcular e apresentar o
        desempenho. Esses dados são informados pelo professor.
      </p>
      <p>
        Registramos ações, identificadores e datas nos logs para
        rastrear operações. Também guardamos a data e a versão do
        aceite dos termos.
      </p>

      <h3>Acesso e recuperação de senha</h3>
      <p>
        O aluno acessa seus resultados, e o professor acessa os
        alunos vinculados à sua conta. O responsável técnico pode
        acessar dados quando necessário à manutenção e ao atendimento
        de solicitações.
      </p>
      <p>
        A recuperação utiliza o Gmail, que processa o e-mail do
        destinatário e a mensagem com o link. Esse link expira em
        15 minutos e é invalidado após o uso. Sua senha pessoal não
        é enviada por e-mail. Os dados não são vendidos nem usados
        pelo projeto para publicidade.
      </p>

      <h3>Materiais de reforço</h3>

      <p>
        Quando você solicita materiais de reforço, o Radar consulta a
        API do YouTube usando o nome da competência, como Divisão ou
        Frações. Essa consulta não inclui seu nome, e-mail, senha ou nota.
        A ação fica registrada nos logs do Radar.
      </p>

      <p>
       Os vídeos são sugestões externas e não foram necessariamente
      revisados pelo professor. Ao abrir um vídeo, você acessa o
      YouTube, onde se aplica a política de privacidade desse serviço.
      </p>

      <h3>Conservação e direitos</h3>
      <p>
        Os dados são mantidos enquanto necessários ao acompanhamento
        e ao funcionamento da conta. A exclusão pode ser solicitada
        ao responsável; não ocorre automaticamente ao sair do sistema.
        Eventual conservação por obrigação legal deverá ser justificada.
      </p>
      <p>
        Você pode solicitar acesso, correção, informações sobre
        compartilhamento e exclusão de dados, observadas as condições
        da LGPD, além dos demais direitos previstos na lei.
      </p>

      <h3>Contato</h3>
      <p>
        Responsável pelo projeto: Kawan Delduque.
        Para dúvidas ou solicitações sobre seus dados, escreva para{" "}
        <a href="mailto:kawan.200207@gmail.com">
          kawan.200207@gmail.com
        </a>.
        Não envie sua senha.
      </p>
    </article>
  );
}