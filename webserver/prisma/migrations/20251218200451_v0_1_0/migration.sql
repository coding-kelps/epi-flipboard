-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "articles" (
    "article_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "published_at" TIMESTAMP(3) NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "image_url" TEXT,
    "publisher_id" INTEGER NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("article_id")
);

-- CreateTable
CREATE TABLE "publishers" (
    "publisher_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "publishers_pkey" PRIMARY KEY ("publisher_id")
);

-- CreateTable
CREATE TABLE "tags" (
    "tag_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "_article_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_article_tags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "articles_originalUrl_key" ON "articles"("originalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "publishers_name_key" ON "publishers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "_article_tags_B_index" ON "_article_tags"("B");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publishers"("publisher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_article_tags" ADD CONSTRAINT "_article_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "articles"("article_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_article_tags" ADD CONSTRAINT "_article_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("tag_id") ON DELETE CASCADE ON UPDATE CASCADE;
