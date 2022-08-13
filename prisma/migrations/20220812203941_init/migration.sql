/*
  Warnings:

  - You are about to drop the column `team` on the `Functionary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Functionary" DROP COLUMN "team",
ADD COLUMN     "teamId" INTEGER;

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "teamDescription" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Functionary" ADD CONSTRAINT "Functionary_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
