// src/app/api/form-fields/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fieldId = formData.get("fieldId");
    const formId = formData.get("formId");
    const direction = formData.get("direction");

    if (
      typeof fieldId !== "string" ||
      typeof formId !== "string" ||
      typeof direction !== "string"
    ) {
      return NextResponse.json(
        { message: "fieldId, formId oder direction fehlen" },
        { status: 400 }
      );
    }

    if (direction !== "up" && direction !== "down") {
      return NextResponse.json(
        { message: "direction muss 'up' oder 'down' sein" },
        { status: 400 }
      );
    }

    // Aktuelles Feld holen
    const currentField = await prisma.formField.findUnique({
      where: { id: fieldId },
    });

    if (!currentField || currentField.formId !== formId) {
      return NextResponse.json(
        { message: "Feld nicht gefunden oder gehört nicht zu diesem Formular" },
        { status: 404 }
      );
    }

    // Alle Felder des Formulars holen, nach order sortiert
    const fields = await prisma.formField.findMany({
      where: { formId },
      orderBy: { order: "asc" },
    });

    const index = fields.findIndex((f) => f.id === fieldId);
    if (index === -1) {
      return NextResponse.json(
        { message: "Feld nicht in Feldliste gefunden" },
        { status: 404 }
      );
    }

    let neighborIndex: number | null = null;
    if (direction === "up" && index > 0) {
      neighborIndex = index - 1;
    } else if (direction === "down" && index < fields.length - 1) {
      neighborIndex = index + 1;
    }

    // Kein Nachbar in gewünschter Richtung (z.B. oberstes Feld nach oben)
    if (neighborIndex === null) {
      const redirectUrl = new URL(`/admin/forms/${formId}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    const neighborField = fields[neighborIndex];

    // Reihenfolge (order) tauschen
    await prisma.$transaction([
      prisma.formField.update({
        where: { id: currentField.id },
        data: { order: neighborField.order },
      }),
      prisma.formField.update({
        where: { id: neighborField.id },
        data: { order: currentField.order },
      }),
    ]);

    const redirectUrl = new URL(`/admin/forms/${formId}`, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error reordering form field:", error);
    return NextResponse.json(
      { message: "Fehler beim Umsortieren des Feldes" },
      { status: 500 }
    );
  }
}
