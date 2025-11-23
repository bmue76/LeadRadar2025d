// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const formId = formData.get("formId");

    if (typeof formId !== "string" || !formId) {
      return NextResponse.json(
        { message: "formId fehlt oder ist ungültig" },
        { status: 400 }
      );
    }

    // Formular inkl. Felder laden
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { message: "Formular nicht gefunden" },
        { status: 404 }
      );
    }

    // Alle Feldwerte aus dem FormData ziehen
    // Erwartetes Schema: name="field_<fieldId>"
    const fieldValues: { fieldId: string; value: string }[] = [];

    formData.forEach((value, key) => {
      if (!key.startsWith("field_")) return;

      const fieldId = key.slice("field_".length);
      if (!fieldId) return;

      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed !== "") {
          fieldValues.push({ fieldId, value: trimmed });
        }
      }
    });

    // Lead + Feldwerte in einer Transaction speichern
    const lead = await prisma.$transaction(async (tx) => {
      const newLead = await tx.lead.create({
        data: {
          formId: form.id,
          accountId: form.accountId, // <- WICHTIG: Pflichtfeld aus deinem Schema
          // weitere Felder wie status, source etc. können hier später ergänzt werden
        },
      });

      if (fieldValues.length > 0) {
        await tx.leadFieldValue.createMany({
          data: fieldValues.map((fv) => ({
            leadId: newLead.id,
            fieldId: fv.fieldId,
            value: fv.value,
          })),
        });
      }

      return newLead;
    });

    console.log("Lead erstellt:", lead.id);

    // fürs Erste zurück zur Formular-Detailseite
    const redirectUrl = new URL(`/admin/forms/${formId}`, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { message: "Fehler beim Speichern des Leads" },
      { status: 500 }
    );
  }
}
