-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('VACANT', 'OCCUPIED');

-- CreateEnum
CREATE TYPE "CastEmploymentType" AS ENUM ('REGULAR', 'TRIAL', 'DISPATCH');

-- CreateEnum
CREATE TYPE "WageType" AS ENUM ('HOURLY', 'DAILY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "NominationType" AS ENUM ('HONSHIMEI', 'JONAI', 'DOHAN');

-- CreateEnum
CREATE TYPE "CashEntryType" AS ENUM ('CASH_IN', 'CASH_OUT');

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableSeat" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "status" "TableStatus" NOT NULL DEFAULT 'VACANT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TableSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isBottle" BOOLEAN NOT NULL DEFAULT false,
    "backAmount" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cast" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employmentType" "CastEmploymentType" NOT NULL DEFAULT 'REGULAR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "wageType" "WageType" NOT NULL DEFAULT 'HOURLY',
    "wageAmount" INTEGER NOT NULL DEFAULT 0,
    "welfareRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "honshimeiBackAmount" INTEGER NOT NULL DEFAULT 0,
    "jonaiBackAmount" INTEGER NOT NULL DEFAULT 0,
    "dohanBackAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeCard" (
    "id" TEXT NOT NULL,
    "castId" TEXT NOT NULL,
    "workDate" DATE NOT NULL,
    "clockInAt" TIMESTAMP(3) NOT NULL,
    "clockOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "status" "VisitStatus" NOT NULL DEFAULT 'OPEN',
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutAt" TIMESTAMP(3),
    "baseMinutes" INTEGER NOT NULL DEFAULT 60,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nomination" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "castId" TEXT NOT NULL,
    "type" "NominationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "castId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BottleSplit" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "castId" TEXT NOT NULL,
    "backAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BottleSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtensionLog" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "isAutoExtend" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtensionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "submittedById" TEXT NOT NULL,
    "salesTotal" INTEGER NOT NULL DEFAULT 0,
    "cashTotal" INTEGER NOT NULL DEFAULT 0,
    "cardTotal" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashRegisterLog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "entryDate" DATE NOT NULL,
    "type" "CashEntryType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashRegisterLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_storeId_idx" ON "User"("storeId");

-- CreateIndex
CREATE INDEX "TableSeat_storeId_idx" ON "TableSeat"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "TableSeat_storeId_name_key" ON "TableSeat"("storeId", "name");

-- CreateIndex
CREATE INDEX "MenuCategory_storeId_idx" ON "MenuCategory"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_storeId_name_key" ON "MenuCategory"("storeId", "name");

-- CreateIndex
CREATE INDEX "MenuItem_storeId_categoryId_idx" ON "MenuItem"("storeId", "categoryId");

-- CreateIndex
CREATE INDEX "Cast_storeId_idx" ON "Cast"("storeId");

-- CreateIndex
CREATE INDEX "TimeCard_castId_workDate_idx" ON "TimeCard"("castId", "workDate");

-- CreateIndex
CREATE INDEX "Visit_storeId_status_idx" ON "Visit"("storeId", "status");

-- CreateIndex
CREATE INDEX "Visit_tableId_idx" ON "Visit"("tableId");

-- CreateIndex
CREATE INDEX "Nomination_visitId_idx" ON "Nomination"("visitId");

-- CreateIndex
CREATE INDEX "Nomination_castId_idx" ON "Nomination"("castId");

-- CreateIndex
CREATE INDEX "OrderItem_visitId_idx" ON "OrderItem"("visitId");

-- CreateIndex
CREATE INDEX "OrderItem_menuItemId_idx" ON "OrderItem"("menuItemId");

-- CreateIndex
CREATE INDEX "BottleSplit_orderItemId_idx" ON "BottleSplit"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "BottleSplit_orderItemId_castId_key" ON "BottleSplit"("orderItemId", "castId");

-- CreateIndex
CREATE INDEX "ExtensionLog_visitId_idx" ON "ExtensionLog"("visitId");

-- CreateIndex
CREATE INDEX "DailyReport_storeId_reportDate_idx" ON "DailyReport"("storeId", "reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_storeId_reportDate_key" ON "DailyReport"("storeId", "reportDate");

-- CreateIndex
CREATE INDEX "CashRegisterLog_storeId_entryDate_idx" ON "CashRegisterLog"("storeId", "entryDate");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableSeat" ADD CONSTRAINT "TableSeat_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cast" ADD CONSTRAINT "Cast_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeCard" ADD CONSTRAINT "TimeCard_castId_fkey" FOREIGN KEY ("castId") REFERENCES "Cast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "TableSeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nomination" ADD CONSTRAINT "Nomination_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nomination" ADD CONSTRAINT "Nomination_castId_fkey" FOREIGN KEY ("castId") REFERENCES "Cast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_castId_fkey" FOREIGN KEY ("castId") REFERENCES "Cast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BottleSplit" ADD CONSTRAINT "BottleSplit_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BottleSplit" ADD CONSTRAINT "BottleSplit_castId_fkey" FOREIGN KEY ("castId") REFERENCES "Cast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtensionLog" ADD CONSTRAINT "ExtensionLog_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRegisterLog" ADD CONSTRAINT "CashRegisterLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRegisterLog" ADD CONSTRAINT "CashRegisterLog_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
