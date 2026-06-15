import { randomUUID } from "crypto";
import ms from "ms";
import { prisma } from "../../lib/prisma";
import { env } from "../config/env";
import {
  CreateVerificationTokenPayload,
  ValidateTokenPayload,
  VerificationTokenType,
} from "../models/auth.model";

const TOKEN_EXPIRY: Record<VerificationTokenType, number> = {
  EMAIL_VERIFICATION: ms(
    env.EMAIL_VERIFICATION_EXPIRY as Parameters<typeof ms>[0]
  ),
  PASSWORD_RESET: ms(env.PASSWORD_RESET_EXPIRY as Parameters<typeof ms>[0]),
};

export const createVerificationToken = async ({
  userId,
  type,
}: CreateVerificationTokenPayload): Promise<string> => {
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type,
    },
  });

  const token = randomUUID();

  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY[type]);

  await prisma.verificationToken.create({
    data: {
      token,
      type,
      userId,
      expiresAt,
    },
  });

  return token;
};

export const validateToken = async ({
  token,
  type,
}: ValidateTokenPayload): Promise<{ userId: string } | null> => {
  const record = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!record) {
    return null;
  }

  if (record.type !== type) {
    return null;
  }

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        id: record.id,
      },
    });

    return null;
  }

  await prisma.verificationToken.delete({
    where: {
      id: record.id,
    },
  });

  return {
    userId: record.userId,
  };
};
