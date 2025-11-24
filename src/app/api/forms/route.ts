// src/app/api/forms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Nicht eingeloggt", { status: 401 });
  }

  const forms = await prisma.form.findMany({
    where: {
      accountId: user.accountId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(forms);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  const formData = await request.formData();

  const name = formData.get("name")?.toString().trim();
  const description =
    formData.get("description")?.toString().trim() || null;
  const eventId =
    formData.get("eventId")?.toString().trim() || undefined;
  const redirectTo =
    formData.get("redirectTo")?.toString() || "/admin/forms";

  if (!name) {
    const url = new URL("/admin/forms/new", request.url);
    url.searchParams.set("error", "missing_name");
    return NextResponse.redirect(url);
  }

  const form = await prisma.form.create({
    data: {
      name,
      description,
      accountId: user.accountId, // 🔐 gehört immer dem eingeloggten Account
      ...(eventId ? { eventId } : {}),
    },
  });

  // redirectTo kann z.B. "/admin/forms/{id}" sein → {id} ersetzen
  const redirectPath = redirectTo.replace("{id}", form.id);

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
