-- CreateTable
CREATE TABLE "reading_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "article_id" BIGINT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reading_history_user_id_idx" ON "reading_history"("user_id");

-- CreateIndex
CREATE INDEX "reading_history_read_at_idx" ON "reading_history"("read_at");
