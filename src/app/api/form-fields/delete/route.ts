// src/app/api/form-fields/delete/route.ts
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

    await prisma.formField.delete({
      where: { id: fieldId },
    });

    const redirectUrl = new URL(`/admin/forms/${formId}`, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error deleting form field:", error);
    return NextResponse.json(
      { message: "Fehler beim Löschen des Feldes" },
      { status: 500 }
    );
  }
}
