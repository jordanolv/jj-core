-- AlterTable
ALTER TABLE "GardeAnimaux" ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT,
ALTER COLUMN "contact" DROP NOT NULL,
ALTER COLUMN "duree" DROP NOT NULL;

-- CreateTable
CREATE TABLE "BudgetYear" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetMonth" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "yearId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetMonth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "monthId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetIncome" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "monthId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetExpense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultBudgetCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#10b981',
    "icon" TEXT,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultBudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetYear_year_idx" ON "BudgetYear"("year");

-- CreateIndex
CREATE INDEX "BudgetYear_profileId_idx" ON "BudgetYear"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetYear_year_profileId_key" ON "BudgetYear"("year", "profileId");

-- CreateIndex
CREATE INDEX "BudgetMonth_yearId_idx" ON "BudgetMonth"("yearId");

-- CreateIndex
CREATE INDEX "BudgetMonth_month_idx" ON "BudgetMonth"("month");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetMonth_yearId_month_key" ON "BudgetMonth"("yearId", "month");

-- CreateIndex
CREATE INDEX "BudgetCategory_monthId_idx" ON "BudgetCategory"("monthId");

-- CreateIndex
CREATE INDEX "BudgetIncome_monthId_idx" ON "BudgetIncome"("monthId");

-- CreateIndex
CREATE INDEX "BudgetIncome_profileId_idx" ON "BudgetIncome"("profileId");

-- CreateIndex
CREATE INDEX "BudgetIncome_date_idx" ON "BudgetIncome"("date");

-- CreateIndex
CREATE INDEX "BudgetExpense_categoryId_idx" ON "BudgetExpense"("categoryId");

-- CreateIndex
CREATE INDEX "BudgetExpense_monthId_idx" ON "BudgetExpense"("monthId");

-- CreateIndex
CREATE INDEX "BudgetExpense_profileId_idx" ON "BudgetExpense"("profileId");

-- CreateIndex
CREATE INDEX "BudgetExpense_date_idx" ON "BudgetExpense"("date");

-- CreateIndex
CREATE INDEX "DefaultBudgetCategory_profileId_idx" ON "DefaultBudgetCategory"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultBudgetCategory_name_profileId_key" ON "DefaultBudgetCategory"("name", "profileId");

-- AddForeignKey
ALTER TABLE "BudgetMonth" ADD CONSTRAINT "BudgetMonth_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "BudgetYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "BudgetMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetIncome" ADD CONSTRAINT "BudgetIncome_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "BudgetMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetExpense" ADD CONSTRAINT "BudgetExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BudgetCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetExpense" ADD CONSTRAINT "BudgetExpense_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "BudgetMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
