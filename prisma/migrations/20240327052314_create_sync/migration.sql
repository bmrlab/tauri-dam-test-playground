-- CreateTable
CREATE TABLE "crdt_operation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" BIGINT NOT NULL,
    "model" TEXT NOT NULL,
    "record_id" BLOB NOT NULL,
    "kind" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "instance_id" INTEGER NOT NULL,
    CONSTRAINT "crdt_operation_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "instance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "instance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pub_id" BLOB NOT NULL,
    "identity" BLOB,
    "remote_identity" BLOB NOT NULL,
    "metadata" BLOB,
    "last_seen" DATETIME NOT NULL,
    "date_created" DATETIME NOT NULL,
    "timestamp" BIGINT
);

-- CreateTable
CREATE TABLE "location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pub_id" BLOB NOT NULL,
    "name" TEXT,
    "path" TEXT,
    "total_capacity" INTEGER,
    "available_capacity" INTEGER,
    "size_in_bytes" BLOB,
    "is_archived" BOOLEAN,
    "generate_preview_media" BOOLEAN,
    "sync_preview_media" BOOLEAN,
    "hidden" BOOLEAN,
    "date_created" DATETIME,
    "instance_id" INTEGER,
    CONSTRAINT "location_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "instance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cloud_crdt_operation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" BIGINT NOT NULL,
    "model" TEXT NOT NULL,
    "record_id" BLOB NOT NULL,
    "kind" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "instance_id" INTEGER NOT NULL,
    CONSTRAINT "cloud_crdt_operation_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "instance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FilePath" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isDir" BOOLEAN NOT NULL,
    "materializedPath" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetObjectId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "locationId" INTEGER,
    CONSTRAINT "FilePath_assetObjectId_fkey" FOREIGN KEY ("assetObjectId") REFERENCES "AssetObject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FilePath_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FilePath" ("assetObjectId", "createdAt", "id", "isDir", "materializedPath", "name", "updatedAt") SELECT "assetObjectId", "createdAt", "id", "isDir", "materializedPath", "name", "updatedAt" FROM "FilePath";
DROP TABLE "FilePath";
ALTER TABLE "new_FilePath" RENAME TO "FilePath";
CREATE INDEX "FilePath_materializedPath_idx" ON "FilePath"("materializedPath");
CREATE UNIQUE INDEX "FilePath_materializedPath_name_key" ON "FilePath"("materializedPath", "name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "instance_pub_id_key" ON "instance"("pub_id");

-- CreateIndex
CREATE UNIQUE INDEX "location_pub_id_key" ON "location"("pub_id");
