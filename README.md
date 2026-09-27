# PFC Matemática

Projeto desenvolvido como parte do Projeto Final de Curso de Engenharia de Software.

# Sobre o projeto

O sistema tem como objetivo auxiliar professores na identificação de dificuldades de aprendizagem dos alunos por meio da análise de desempenho em competências específicas.

O projeto terá foco na disciplina de Matemática, podendo futuramente ser adaptado para outras disciplinas.

# Tecnologias previstas

- React
- TypeScript
- Node.js
- Express
- PostgreSQL
- JWT
- Prisma

# Primeira funcionalidade

Foi implementado o registro de desempenho dos alunos por competência
de Matemática.

Na tela, são informados o aluno, a competência, o total de questões,
os acertos e a meta. O sistema salva esses dados no banco e calcula
o percentual de acertos.

Se o percentual for igual ou maior que a meta, aparece “Meta atingida”.
Caso contrário, aparece “Abaixo da meta”.

O sistema também impede dados inválidos, como uma quantidade de
acertos maior que o total de questões.

# Tecnologias

React, TypeScript, Node.js, Express, PostgreSQL e Prisma.

# Como executar

É necessário ter Node.js 24 LTS e PostgreSQL instalados.

1. Criar o banco `pfc_matematica`.
2. Na pasta `backend`, copiar `.env.example` para `.env`
   Preencher a conexão com o banco, a chave JWT, as configurações
do Gmail e a chave da API do YouTube. Para o Gmail, usar uma
senha de app. Manter FRONTEND_URL como http://localhost:5173
durante a execução local.
3. Executar no terminal do backend:


npm ci
npx prisma migrate deploy
npx prisma generate
npm run dev


4. Em outro terminal, dentro de `frontend`, executar:


npm ci
npm run dev


5. Abrir o endereço
   `http://localhost:5173`.

Os dois terminais precisam continuar rodando.

## API de materiais de reforço

O Radar usa a API do YouTube para buscar até três vídeos sobre
a competência avaliada, como Divisão ou Frações. A tela mostra
o título, o canal e o link de cada vídeo.

# Configuração

Ative a YouTube Data API v3 no Google Cloud e crie uma chave
restrita a essa API. Coloque no backend/.env:

YOUTUBE_API_KEY=sua_chave_aqui

Depois, reinicie o backend. Não publique o .env no GitHub.

# Como funciona

A tela chama GET /desempenhos/:id/reforco, enviando o token
do login no cabeçalho Authorization: Bearer TOKEN.

O aluno só consulta os próprios desempenhos, e o professor
consulta os dos seus alunos. É necessário ter trocado a senha
provisória e aceitado os termos.

O backend consulta:
https://www.googleapis.com/youtube/v3/search

A busca usa “matemática aula” mais a competência, prioriza
português e retorna até três vídeos. Não envia nome, e-mail,
senha ou nota do aluno.

A resposta contém a competência e uma lista de materiais
com id, título, canal e link. A consulta fica registrada
nos logs como CONSULTAR_REFORCO_YOUTUBE.

# Arquivos principais

- rotasReforco.ts: endereço e verificações de acesso.
- reforcoController.ts: consulta o desempenho e registra o log.
- youtubeApi.ts: busca os vídeos no YouTube.
- MaterialReforco.tsx: mostra os materiais na tela.

# Teste e limitações

Entre no sistema e clique em “Buscar material de reforço”
em um resultado. Confira os vídeos e abra um dos links.

A busca depende de internet e da cota da API. Se falhar
ou demorar mais de 10 segundos, o sistema mostra um erro.
Os vídeos são sugestões e podem não corresponder ao nível
do aluno.

Documentação oficial:
https://developers.google.com/youtube/v3/docs/search/list