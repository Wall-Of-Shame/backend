-- CreateTable
CREATE TABLE "Contact" (
    "pers1_id" TEXT NOT NULL,
    "pers2_id" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("pers1_id","pers2_id")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_pers1_id_fkey" FOREIGN KEY ("pers1_id") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_pers2_id_fkey" FOREIGN KEY ("pers2_id") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
