import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordKandidat = await bcrypt.hash("kandidat123", 10);
  const passwordHR = await bcrypt.hash("hr123456", 10);

  await prisma.user.create({
    data: {
      nama: "Asep",
      email: "kandidat@gmail.com",
      nik: "1234567890123456",
      password: passwordKandidat,
      role: "KANDIDAT",
    },
  });

  await prisma.user.create({
    data: {
      nama: "HR JobPortal",
      email: "hr@gmail.com",
      nik: "3200000000000001",
      password: passwordHR,
      role: "HR",
    },
  });

  console.log("Akun berhasil dibuat!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });