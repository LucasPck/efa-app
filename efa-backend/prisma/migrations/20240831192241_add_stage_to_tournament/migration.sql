/*
  Warnings:

  - Added the required column `stage` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "stage" TEXT NOT NULL;
