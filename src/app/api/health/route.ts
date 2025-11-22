import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Einfacher Check: Kann Prisma irgendeine Query zum DB schicken?
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Healthcheck failed", error);
    return NextResponse.json(
      { status: "error", message: "Healthcheck failed" },
      { status: 500 }
    );
  }
}
