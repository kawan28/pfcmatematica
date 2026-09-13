-- CreateTable
CREATE TABLE "Desempenho" (
    "id" SERIAL NOT NULL,
    "aluno" TEXT NOT NULL,
    "competencia" TEXT NOT NULL,
    "totalQuestoes" INTEGER NOT NULL,
    "acertos" INTEGER NOT NULL,
    "meta" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Desempenho_pkey" PRIMARY KEY ("id")
);
