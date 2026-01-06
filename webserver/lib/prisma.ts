import { PrismaClient as PrismaClientIdentity } from '@/app/generated/prisma-identity/client'
import { PrismaClient as PrismaClientContent } from '@/app/generated/prisma-content/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getDatabaseUrl } from "@/lib/database-url";



const globalForPrismaIdentity = global as unknown as {
  prismaIdentity?: PrismaClientIdentity
};

export function getPrismaIdentity(): PrismaClientIdentity {
  if (globalForPrismaIdentity.prismaIdentity) {
    return globalForPrismaIdentity.prismaIdentity;
  }

  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl("IDENTITY_DB"),
  });

  const prisma = new PrismaClientIdentity({ adapter });

  if (process.env.NODE_ENV !== 'production') globalForPrismaIdentity.prismaIdentity = prisma;

  return prisma;
}

const globalForPrismaContent = global as unknown as {
  prismaContent?: PrismaClientContent
};

export function getPrismaContent(): PrismaClientContent {
  if (globalForPrismaContent.prismaContent) {
    return globalForPrismaContent.prismaContent;
  }

  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl("CONTENT_DB"),
  });

  const prisma = new PrismaClientContent({ adapter });

  if (process.env.NODE_ENV !== 'production') globalForPrismaContent.prismaContent = prisma;

  return prisma;
}
