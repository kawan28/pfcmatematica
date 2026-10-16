import express from "express";
import rotasLogin from "./rotasLogin";
import rotasAlunos from "./rotasAlunos";
import rotasSenha from "./rotasSenha";
import rotasAuditoria from "./rotasAuditoria";
import rotasRecuperacao from "./rotasRecuperacao";
import rotasTermos from "./rotasTermos";
import rotasReforco from "./rotasReforco";
import rotasProfessor from "./rotasProfessor";
import rotasDesempenho from "./rotasDesempenho";

const app = express();

app.use(express.json());

app.use(rotasProfessor);

app.use(rotasLogin);

app.use(rotasRecuperacao);

app.use(rotasTermos);

app.use(rotasReforco);

app.use(rotasAuditoria);

app.use(rotasSenha);

app.use(rotasAlunos);

app.use(rotasDesempenho);

app.get("/", (req, res) => {
  res.json({
    mensagem: "Backend do PFC funcionando!",
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
