-- CreateEnum
CREATE TYPE "SignInType" AS ENUM ('username');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGINT NOT NULL,
    "sign_in_type" "SignInType" NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
