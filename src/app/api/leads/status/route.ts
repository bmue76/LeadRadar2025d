// src/app/api/leads/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = [
  "NEW",
  "OPEN",
  "QUALIFIED",
  "WON",
  "LOST",
  "ARCHIVED",
] as const;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const leadId = formData.get("leadId")?.toString();
    const formId = formData.get("formId")?.toString();
    const status = formData.get("status")?.toString();
    const notes = formData.get("notes")?.toString() ?? undefined;

    const redirectTo =
      formData.get("redirectTo")?.toString() ||
      (leadId && formId
        ? `/admin/forms/${formId}/leads/${leadId}`
        : "/admin/forms");

    if (!leadId || !status) {
      return new NextResponse("leadId oder status fehlt", { status: 400 });
    }

    if (
      !(
        ALLOWED_STATUSES as readonly string[]
      ).includes(status.toUpperCase())
    ) {
      return new NextResponse("Ungültiger Status-Wert", { status: 400 });
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: status.toUpperCase() as any,
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return new NextResponse(null, {
      status: 303,
      headers: {
        Location: redirectTo,
      },
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Leads:", error);
    return new NextResponse("Interner Serverfehler", { status: 500 });
  }
}
