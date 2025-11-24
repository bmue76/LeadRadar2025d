// src/lib/session.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export const SESSION_COOKIE_NAME = "lr_session";

export type AuthUser = Prisma.UserGetPayload<{
  include: { account: true };
}>;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET ist nicht gesetzt (.env)");
  }
  return secret;
}

export function createSessionToken(userId: string): string {
  const secret = getJwtSecret();
  return jwt.sign({ userId }, secret, {
    expiresIn: "30d",
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  // WICHTIG: cookies() kann ein Promise sein → await
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { account: true },
    });

    if (!user) return null;
    return user;
  } catch (error) {
    console.warn("getCurrentUser: ungültiges Token oder Fehler:", error);
    return null;
  }
}
