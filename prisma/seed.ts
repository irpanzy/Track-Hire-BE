import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { env } from "../src/config/env";

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: env.ADMIN_EMAIL,
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    env.ADMIN_PASSWORD,
    10
  );

  await prisma.user.create({
    data: {
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });