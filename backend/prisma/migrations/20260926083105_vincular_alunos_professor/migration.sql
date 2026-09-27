-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "professorId" INTEGER,
ADD COLUMN     "termosAceitosEm" TIMESTAMP(3),
ADD COLUMN     "trocarSenha" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "versaoTermos" TEXT,
ADD COLUMN     "versaoToken" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
