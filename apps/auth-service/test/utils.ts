import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

export async function resetTestDB() {
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser(isVerified?: boolean) {
  const hashedPassword = await argon2.hash('testpassword');
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      isVerified: isVerified,
      verificationToken: null,
    },
  });
}
