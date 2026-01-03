-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('Active', 'Away', 'Busy');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availability" "Availability" NOT NULL DEFAULT 'Active',
ADD COLUMN     "status" TEXT;
