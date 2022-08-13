-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BASIC', 'RH', 'MANAGER');

-- CreateTable
CREATE TABLE "Functionary" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BASIC',
    "team" TEXT NOT NULL,
    "amountPerHour" INTEGER,
    "rhManagerId" INTEGER,
    "hoursWorked" INTEGER NOT NULL,

    CONSTRAINT "Functionary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "gitHubRepoUrl" TEXT NOT NULL,
    "functionaryId" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_functionaryId_fkey" FOREIGN KEY ("functionaryId") REFERENCES "Functionary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
