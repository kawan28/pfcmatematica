/*
  Warnings:

  - A unique constraint covering the columns `[recuperacaoTokenHash]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "recuperacaoExpiraEm" TIMESTAMP(3),
ADD COLUMN     "recuperacaoTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_recuperacaoTokenHash_key" ON "Usuario"("recuperacaoTokenHash");
