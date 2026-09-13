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
   e preencher os dados de conexão com o banco.
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
