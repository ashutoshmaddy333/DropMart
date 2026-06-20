-- CreateTable: master_permission_groups
CREATE TABLE "master_permission_groups" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_permission_groups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "master_permission_groups_code_key" ON "master_permission_groups"("code");

-- CreateTable: master_user_statuses
CREATE TABLE "master_user_statuses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_user_statuses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "master_user_statuses_code_key" ON "master_user_statuses"("code");

-- Seed permission groups
INSERT INTO "master_permission_groups" ("id", "code", "label", "description", "sortOrder", "updatedAt") VALUES
  ('pg_catalog', 'catalog', 'Catalog', 'Product catalog management', 1, CURRENT_TIMESTAMP),
  ('pg_orders', 'orders', 'Orders', 'Order processing and tracking', 2, CURRENT_TIMESTAMP),
  ('pg_payments', 'payments', 'Payments', 'Payment and refund operations', 3, CURRENT_TIMESTAMP),
  ('pg_users_access', 'users_access', 'Users & Access', 'User management and RBAC', 4, CURRENT_TIMESTAMP),
  ('pg_suppliers', 'suppliers', 'Suppliers', 'Supplier onboarding and management', 5, CURRENT_TIMESTAMP),
  ('pg_analytics', 'analytics', 'Analytics', 'Reports and dashboards', 6, CURRENT_TIMESTAMP),
  ('pg_delivery', 'delivery', 'Delivery', 'Live delivery and tracking', 7, CURRENT_TIMESTAMP);

-- Seed user statuses
INSERT INTO "master_user_statuses" ("id", "code", "label", "color", "sortOrder", "updatedAt") VALUES
  ('us_active', 'active', 'Active', '#10b981', 1, CURRENT_TIMESTAMP),
  ('us_inactive', 'inactive', 'Inactive', '#6b7280', 2, CURRENT_TIMESTAMP),
  ('us_suspended', 'suspended', 'Suspended', '#ef4444', 3, CURRENT_TIMESTAMP),
  ('us_pending', 'pending_verification', 'Pending Verification', '#f59e0b', 4, CURRENT_TIMESTAMP);

-- Alter master_permissions: add new columns
ALTER TABLE "master_permissions" ADD COLUMN "description" TEXT;
ALTER TABLE "master_permissions" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "master_permissions" ADD COLUMN "groupId" TEXT;

-- Migrate group text to groupId FK
UPDATE "master_permissions" SET "groupId" = 'pg_catalog' WHERE "group" = 'Catalog';
UPDATE "master_permissions" SET "groupId" = 'pg_orders' WHERE "group" = 'Orders';
UPDATE "master_permissions" SET "groupId" = 'pg_payments' WHERE "group" = 'Payments';
UPDATE "master_permissions" SET "groupId" = 'pg_users_access' WHERE "group" = 'Users & Access';
UPDATE "master_permissions" SET "groupId" = 'pg_suppliers' WHERE "group" = 'Suppliers';
UPDATE "master_permissions" SET "groupId" = 'pg_analytics' WHERE "group" = 'Analytics';
UPDATE "master_permissions" SET "groupId" = 'pg_delivery' WHERE "group" = 'Delivery';

-- Fallback: any unmapped permissions go to catalog
UPDATE "master_permissions" SET "groupId" = 'pg_catalog' WHERE "groupId" IS NULL;

ALTER TABLE "master_permissions" ALTER COLUMN "groupId" SET NOT NULL;
ALTER TABLE "master_permissions" DROP COLUMN "group";

ALTER TABLE "master_permissions" ADD CONSTRAINT "master_permissions_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "master_permission_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Alter role_permissions: add audit columns
ALTER TABLE "role_permissions" ADD COLUMN "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "role_permissions" ADD COLUMN "grantedBy" TEXT;

-- Alter users: add status and last login
ALTER TABLE "users" ADD COLUMN "statusId" TEXT;
ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

UPDATE "users" SET "statusId" = 'us_active' WHERE "statusId" IS NULL;

ALTER TABLE "users" ALTER COLUMN "statusId" SET NOT NULL;

ALTER TABLE "users" ADD CONSTRAINT "users_statusId_fkey"
  FOREIGN KEY ("statusId") REFERENCES "master_user_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create notifications table if missing (drift fix)
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_createdAt_idx"
  ON "notifications"("userId", "isRead", "createdAt");

DO $$ BEGIN
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
