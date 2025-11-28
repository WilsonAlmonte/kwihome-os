import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./prisma/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function getPrismaClient() {
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  return prisma;
}
