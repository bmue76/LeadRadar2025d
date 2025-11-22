import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const accountCount = await prisma.account.count();

    return NextResponse.json({
      status: "ok",
      accountCount,
    });
  } catch (error) {
    console.error("Healthcheck failed", error);
    return NextResponse.json(
      { status: "error", message: "Healthcheck failed" },
      { status: 500 }
    );
  }
}
