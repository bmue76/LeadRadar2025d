// src/app/admin/forms/[id]/fields/[fieldId]/page.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type FormFieldWithForm = Prisma.FormFieldGetPayload<{
  include: {
    form: {
      include: {
        account: true;
        event: true;
      };
    };
  };
}>;

export const dynamic = "force-dynamic";

const fieldTypeLabels: Record<string, string> = {
  TEXT: "Textfeld",
  TEXTAREA: "Mehrzeilig",
  NUMBER: "Zahl",
  SELECT: "Auswahl (einfach)",
  MULTISELECT: "Auswahl (mehrfach)",
  CHECKBOX: "Checkbox",
  RADIO: "Radio",
  EMAIL: "E-Mail",
  PHONE: "Telefon",
  DATE: "Datum",
  TIME: "Uhrzeit",
};

export default async function EditFormFieldPage({
  params,
}: {
  params: Promise<{ id: string; fieldId: string }>;
}) {
  // ⬇️ params auflösen
  const { id, fieldId } = await params;

  console.log("EditFormFieldPage params =", { id, fieldId });

  const fields: FormFieldWithForm[] = await prisma.formField.findMany({
    where: { formId: id },
    include: {
      form: {
        include: {
          account: true,
          event: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  if (fields.length === 0) {
    notFound();
  }

  let field = fields.find((f) => f.id === fieldId) ?? null;

  if (!field) {
    console.warn(
      "EditFormFieldPage: Kein Feld mit dieser ID gefunden, fieldId =",
      fieldId,
      "Verfügbare Feld-IDs:",
      fields.map((f) => f.id)
    );
    field = fields[0];
  }

  const form = field.form;

  let optionsCsv: string | null = null;
  if (field.options) {
    try {
      const parsed = JSON.parse(field.options) as string[];
      optionsCsv = parsed.join(", ");
    } catch {
      optionsCsv = field.options;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Formularfeld bearbeiten
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Anpassung von Label, Typ, Reihenfolge, Pflichtfeld,
              Placeholder und Optionen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/forms/${form.id}`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Zurück zum Formular
            </Link>
            <Link
              href="/admin/forms"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Formular-Übersicht
            </Link>
          </div>
        </header>

        {/* Kontext */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Kontext
          </h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Formular</dt>
              <dd className="text-slate-900">{form.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Account</dt>
              <dd className="text-slate-900">{form.account?.name ?? "–"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Event</dt>
              <dd className="text-slate-900">
                {form.event
                  ? `${form.event.name} (${form.event.location ?? "–"})`
                  : "–"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Bearbeitungsformular */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Feld-Einstellungen
          </h2>

          <form action="/api/form-fields/update" method="post" className="space-y-4">
            <input type="hidden" name="fieldId" value={field.id} />
            <input type="hidden" name="formId" value={form.id} />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Label *
                </label>
                <input
                  name="label"
                  required
                  defaultValue={field.label}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Feldtyp *
                </label>
                <select
                  name="type"
                  required
                  defaultValue={field.type}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white"
                >
                  {Object.entries(fieldTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Reihenfolge
                </label>
                <input
                  name="order"
                  type="number"
                  defaultValue={field.order}
                  min={1}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Placeholder
                </label>
                <input
                  name="placeholder"
                  defaultValue={field.placeholder ?? ""}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[auto,1fr] items-center">
              <div className="flex items-center gap-2">
                <input
                  id="required"
                  name="required"
                  type="checkbox"
                  defaultChecked={field.required}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label
                  htmlFor="required"
                  className="text-xs font-medium text-slate-600"
                >
                  Pflichtfeld
                </label>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Optionen (kommagetrennt, z.B. Kalt, Warm, Heiss)
                </label>
                <input
                  name="options"
                  defaultValue={optionsCsv ?? ""}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href={`/admin/forms/${form.id}`}
                className="rounded-md border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Änderungen speichern
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
