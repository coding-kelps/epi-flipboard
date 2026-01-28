-- CreateTable
CREATE TABLE "followed_feeds" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "feed_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "followed_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "followed_feeds_user_id_feed_id_key" ON "followed_feeds"("user_id", "feed_id");
