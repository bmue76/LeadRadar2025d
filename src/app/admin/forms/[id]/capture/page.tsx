// src/app/admin/forms/[id]/capture/page.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type FormWithRelations = Prisma.FormGetPayload<{
  include: {
    account: true;
    event: true;
    fields: true;
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

export default async function FormCapturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 16 / React 19: params ist ein Promise
  const { id } = await params;

  const form: FormWithRelations | null = await prisma.form.findUnique({
    where: { id },
    include: {
      account: true,
      event: true,
      fields: true,
    },
  });

  if (!form) {
    notFound();
  }

  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);

  const eventInfo = form.event
    ? `${form.event.name}${
        form.event.location ? ` · ${form.event.location}` : ""
      }`
    : "Kein Event zugeordnet";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Lead erfassen
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Formular-basierte Leaderfassung für das Event{" "}
              <span className="font-semibold text-slate-900">
                {eventInfo}
              </span>
              .
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Formular: <span className="font-medium">{form.name}</span> ·
              Account:{" "}
              <span className="font-medium">
                {form.account?.name ?? "–"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/forms/${form.id}`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Zurück zu den Formulardetails
            </Link>
          </div>
        </header>

        {/* Erfassungsformular */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <form action="/api/leads" method="post" className="space-y-4">
            {/* Pflicht: Formular-ID */}
            <input type="hidden" name="formId" value={form.id} />

            {sortedFields.length === 0 ? (
              <p className="text-sm text-slate-600">
                Dieses Formular enthält noch keine Felder. Bitte zuerst im
                Admin-Backend Felder anlegen.
              </p>
            ) : (
              sortedFields.map((field) => {
                const label = fieldTypeLabels[field.type] ?? field.type;

                // Optionen parsen (für Select, MultiSelect, Radio, etc.)
                let options: string[] = [];
                if (field.options) {
                  try {
                    const parsed = JSON.parse(field.options) as string[];
                    if (Array.isArray(parsed)) {
                      options = parsed;
                    }
                  } catch {
                    // Fallback: Kommagetrennt
                    options = field.options
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean);
                  }
                }

                const name = `field_${field.id}`;
                const isRequired = field.required;

                return (
                  <div
                    key={field.id}
                    className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <label className="block text-sm font-medium text-slate-800">
                      {field.label}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        ({label}
                        {isRequired ? ", Pflichtfeld" : ""})
                      </span>
                      {isRequired && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </label>

                    {field.placeholder && (
                      <p className="text-xs text-slate-500">
                        {field.placeholder}
                      </p>
                    )}

                    {/* Eingabeelement je nach Typ */}
                    <div>
                      {field.type === "TEXT" && (
                        <input
                          name={name}
                          type="text"
                          required={isRequired}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      )}

                      {field.type === "TEXTAREA" && (
                        <textarea
                          name={name}
                          required={isRequired}
                          rows={3}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      )}

                      {field.type === "NUMBER" && (
                        <input
                          name={name}
                          type="number"
                          required={isRequired}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      )}

                      {field.type === "EMAIL" && (
                        <input
                          name={name}
                          type="email"
                          required={isRequired}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      )}

                      {field.type === "PHONE" && (
                        <input
                          name={name}
                          type="tel"
                          required={isRequired}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      )}

                      {field.type === "DATE" && (
                        <input
                          name={name}
                          type="date"
                          required={isRequired}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      )}

                      {field.type === "TIME" && (
                        <input
                          name={name}
                          type="time"
                          required={isRequired}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      )}

                      {field.type === "SELECT" && (
                        <select
                          name={name}
                          required={isRequired}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Bitte wählen…
                          </option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "MULTISELECT" && (
                        <select
                          name={name}
                          multiple
                          required={isRequired}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white"
                        >
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "CHECKBOX" && (
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            id={field.id}
                            name={name}
                            type="checkbox"
                            value="1"
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <label
                            htmlFor={field.id}
                            className="text-sm text-slate-700"
                          >
                            {field.placeholder ?? "Ja / aktiviert"}
                          </label>
                        </div>
                      )}

                      {field.type === "RADIO" && options.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {options.map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-2 text-sm text-slate-700"
                            >
                              <input
                                type="radio"
                                name={name}
                                value={opt}
                                required={isRequired}
                                className="h-4 w-4 border-slate-300"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Fallback falls ein unbekannter Typ auftaucht */}
                      {![
                        "TEXT",
                        "TEXTAREA",
                        "NUMBER",
                        "SELECT",
                        "MULTISELECT",
                        "CHECKBOX",
                        "RADIO",
                        "EMAIL",
                        "PHONE",
                        "DATE",
                        "TIME",
                      ].includes(field.type) && (
                        <input
                          name={name}
                          type="text"
                          required={isRequired}
                          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {sortedFields.length > 0 && (
              <div className="flex justify-end gap-2 pt-2">
                <Link
                  href={`/admin/forms/${form.id}`}
                  className="rounded-md border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Abbrechen
                </Link>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Lead speichern
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
