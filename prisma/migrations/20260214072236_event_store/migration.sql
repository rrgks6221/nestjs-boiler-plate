-- CreateTable
CREATE TABLE "event_store" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "aggregate" VARCHAR(20) NOT NULL,
    "aggregate_id" BIGINT NOT NULL,
    "event_name" TEXT NOT NULL,
    "event_payload" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "occurred" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_store_aggregate_id_version_key" ON "event_store"("aggregate_id", "version");
