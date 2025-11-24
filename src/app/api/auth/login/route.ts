// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const emailRaw = formData.get("email")?.toString();
  const password = formData.get("password")?.toString() ?? "";
  const redirectTo =
    formData.get("redirectTo")?.toString() || "/admin/forms";

  const email = emailRaw?.toLowerCase().trim();

  if (!email || !password) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "missing");
    return NextResponse.redirect(url);
  }

  // Explizit auswählen, was wir brauchen → Typ enthält passwordHash sicher
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      accountId: true,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "invalid");
    return NextResponse.redirect(url);
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "invalid");
    return NextResponse.redirect(url);
  }

  const token = createSessionToken(user.id);

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
  });

  return response;
}
