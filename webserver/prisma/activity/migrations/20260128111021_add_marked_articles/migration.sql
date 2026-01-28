-- CreateTable
CREATE TABLE "marked_articles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "article_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marked_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marked_articles_user_id_idx" ON "marked_articles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "marked_articles_user_id_article_id_key" ON "marked_articles"("user_id", "article_id");
