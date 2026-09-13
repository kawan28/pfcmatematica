import express from "express";
import { prisma } from "./prisma";

const app = express();

app.use(express.json());

function analisarDesempenho(dados: {
  acertos: number;
  totalQuestoes: number;
  meta: number;
}) {
  const percentual = (dados.acertos / dados.totalQuestoes) * 100;

  return {
    percentual: Number(percentual.toFixed(2)),
    classificacao:
      percentual >= dados.meta ? "Meta atingida" : "Abaixo da meta",
  };
}

app.get("/", (req, res) => {
  res.json({
    mensagem: "Backend do PFC funcionando!",
  });
});

app.get("/desempenhos", async (req, res) => {
  try {
    const desempenhos = await prisma.desempenho.findMany({
      orderBy: { criadoEm: "desc" },
    });

    res.json(
      desempenhos.map((desempenho) => ({
        ...desempenho,
        ...analisarDesempenho(desempenho),
      }))
    );
  } catch (erro) {
    console.error("Erro ao consultar desempenhos:", erro);

    res.status(500).json({
      mensagem: "Não foi possível consultar os desempenhos.",
    });
  }
});

app.post("/desempenhos", async (req, res) => {
  const { aluno, competencia, totalQuestoes, acertos, meta } =
    req.body ?? {};

  if (typeof aluno !== "string" || aluno.trim() === "") {
    res.status(400).json({
      mensagem: "Informe a identificação do aluno.",
    });
    return;
  }

  if (typeof competencia !== "string" || competencia.trim() === "") {
    res.status(400).json({
      mensagem: "Informe a competência avaliada.",
    });
    return;
  }

  if (!Number.isInteger(totalQuestoes) || totalQuestoes < 1) {
    res.status(400).json({
      mensagem: "O total de questões deve ser um inteiro maior que zero.",
    });
    return;
  }

  if (
    !Number.isInteger(acertos) ||
    acertos < 0 ||
    acertos > totalQuestoes
  ) {
    res.status(400).json({
      mensagem: "Os acertos devem ser um inteiro entre zero e o total de questões.",
    });
    return;
  }

  if (!Number.isInteger(meta) || meta < 0 || meta > 100) {
    res.status(400).json({
      mensagem: "A meta deve ser um número inteiro entre 0 e 100.",
    });
    return;
  }

  try {
    const desempenho = await prisma.desempenho.create({
      data: {
        aluno: aluno.trim(),
        competencia: competencia.trim(),
        totalQuestoes,
        acertos,
        meta,
      },
    });

    res.status(201).json({
      ...desempenho,
      ...analisarDesempenho(desempenho),
    });
  } catch (erro) {
    console.error("Erro ao registrar desempenho:", erro);

    res.status(500).json({
      mensagem: "Não foi possível registrar o desempenho.",
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});