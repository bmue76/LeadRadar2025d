// src/app/api/form-fields/duplicate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fieldId = formData.get("fieldId");
    const formId = formData.get("formId");

    if (typeof fieldId !== "string" || typeof formId !== "string") {
      return NextResponse.json(
        { message: "fieldId oder formId fehlen" },
        { status: 400 }
      );
    }

    // Ursprüngliches Feld holen
    const originalField = await prisma.formField.findUnique({
      where: { id: fieldId },
    });

    if (!originalField || originalField.formId !== formId) {
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

    const originalIndex = fields.findIndex((f) => f.id === fieldId);
    if (originalIndex === -1) {
      return NextResponse.json(
        { message: "Feld nicht in Feldliste gefunden" },
        { status: 404 }
      );
    }

    // Neuer Platz direkt nach dem Originalfeld
    const newOrder = originalField.order + 1;

    // Alle Felder, die danach kommen, um 1 nach hinten schieben
    const fieldsToShift = fields.filter((f) => f.order >= newOrder);

    const updateOperations = fieldsToShift.map((f) =>
      prisma.formField.update({
        where: { id: f.id },
        data: { order: f.order + 1 },
      })
    );

    // Duplikat an neuer Position einfügen
    const createDuplicate = prisma.formField.create({
      data: {
        formId,
        label: `${originalField.label} (Kopie)`,
        type: originalField.type,
        order: newOrder,
        required: originalField.required,
        placeholder: originalField.placeholder,
        options: originalField.options,
      },
    });

    await prisma.$transaction([...updateOperations, createDuplicate]);

    const redirectUrl = new URL(`/admin/forms/${formId}`, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error duplicating form field:", error);
    return NextResponse.json(
      { message: "Fehler beim Duplizieren des Feldes" },
      { status: 500 }
    );
  }
}
