// src/app/api/form-fields/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const formId = formData.get("formId");
    const label = formData.get("label");
    const type = formData.get("type");
    const orderRaw = formData.get("order");
    const requiredRaw = formData.get("required");
    const placeholder = formData.get("placeholder");
    const optionsRaw = formData.get("options");

    if (
      typeof formId !== "string" ||
      typeof label !== "string" ||
      typeof type !== "string"
    ) {
      return NextResponse.json(
        { message: "formId, label oder type fehlen" },
        { status: 400 }
      );
    }

    const order =
      typeof orderRaw === "string" ? parseInt(orderRaw, 10) || 0 : 0;
    const required = requiredRaw === "on";

    let options: string | null = null;
    if (typeof optionsRaw === "string" && optionsRaw.trim().length > 0) {
      const parts = optionsRaw
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      if (parts.length > 0) {
        // Wir speichern Optionen als JSON-Array (["A","B","C"])
        options = JSON.stringify(parts);
      }
    }

    await prisma.formField.create({
      data: {
        formId,
        label,
        type: type as any, // Prisma-Enum, zur Vereinfachung hier any
        order,
        required,
        placeholder:
          typeof placeholder === "string" && placeholder.trim().length > 0
            ? placeholder.trim()
            : null,
        options,
      },
    });

    // Nach dem Anlegen zurück zur Formular-Detailseite
    const redirectUrl = new URL(`/admin/forms/${formId}`, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error creating form field:", error);
    return NextResponse.json(
      { message: "Fehler beim Anlegen des Feldes" },
      { status: 500 }
    );
  }
}
