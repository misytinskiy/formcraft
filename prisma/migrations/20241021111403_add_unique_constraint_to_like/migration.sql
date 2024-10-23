/*
  Warnings:

  - A unique constraint covering the columns `[formId,userId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_formId_userId_key" ON "Like"("formId", "userId");
