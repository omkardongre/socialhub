// apps/auth-service/test/utils.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export async function resetTestDB() {
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser() {
  const hashedPassword = await bcrypt.hash('testpassword', SALT_ROUNDS);
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      isVerified: true,
      verificationToken: null,
    },
  });
}
