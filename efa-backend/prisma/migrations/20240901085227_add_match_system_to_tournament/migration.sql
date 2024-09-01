-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "winnerId" TEXT;

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "team1Id" TEXT NOT NULL,
    "team2Id" TEXT NOT NULL,
    "winnerId" TEXT,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);
