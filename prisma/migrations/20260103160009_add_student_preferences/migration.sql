-- CreateTable
CREATE TABLE "SlotTypePreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slotTypeId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlotTypePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlotTypePreference_userId_slotTypeId_key" ON "SlotTypePreference"("userId", "slotTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchPreference_userId_batchId_key" ON "BatchPreference"("userId", "batchId");

-- AddForeignKey
ALTER TABLE "SlotTypePreference" ADD CONSTRAINT "SlotTypePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotTypePreference" ADD CONSTRAINT "SlotTypePreference_slotTypeId_fkey" FOREIGN KEY ("slotTypeId") REFERENCES "SlotType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchPreference" ADD CONSTRAINT "BatchPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchPreference" ADD CONSTRAINT "BatchPreference_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
