// src/app/admin/forms/[id]/leads/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Optional: erzwingt, dass die Route immer serverseitig berechnet wird
export const dynamic = "force-dynamic";

function escapeCsv(value: string): string {
  const v = value.replace(/"/g, '""');
  const needsQuotes =
    v.includes(";") || v.includes(",") || v.includes("\n") || v.includes('"');
  return needsQuotes ? `"${v}"` : v;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // WICHTIG: params zuerst "awaiten"
  const { id } = await params;
  const formId = id;

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      fields: true,
    },
  });

  if (!form) {
    return new NextResponse("Formular nicht gefunden", { status: 404 });
  }

  const leads = await prisma.lead.findMany({
    where: { formId },
    include: {
      values: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const fields = [...form.fields].sort((a, b) => a.order - b.order);

  // Kopfzeile
  const headerColumns = [
    "Lead-ID",
    "Erstellt am",
    "Status",
    ...fields.map((f) => f.label),
  ];

  const lines: string[] = [];
  lines.push(headerColumns.map(escapeCsv).join(";"));

  for (const lead of leads) {
    const valuesByFieldId = new Map(
      lead.values.map((v) => [v.fieldId, v.value ?? ""])
    );

    const createdAt = new Date(lead.createdAt).toISOString();

    const rowValues: string[] = [
      lead.id,
      createdAt,
      lead.status ?? "",
      ...fields.map((f) => valuesByFieldId.get(f.id) ?? ""),
    ];

    lines.push(rowValues.map((v) => escapeCsv(v ?? "")).join(";"));
  }

  const csv = lines.join("\r\n");

  const safeName =
    form.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "leads";

  const fileName = `${safeName}-${formId}-leads.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
