// src/app/admin/forms/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type FormWithRelations = Prisma.FormGetPayload<{
  include: {
    account: true;
    event: true;
    fields: true;
    leads: true;
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

export default async function FormDetailPage({
  params,
}: {
  params: { id: string };
}) {
  console.log("FormDetailPage params.id =", params.id);

  // 1) Alle Formulare mit Relationen holen
  const forms: FormWithRelations[] = await prisma.form.findMany({
    include: {
      account: true,
      event: true,
      fields: true,
      leads: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (forms.length === 0) {
    // Es gibt wirklich gar keine Formulare
    notFound();
  }

  // 2) Formular mit passender ID in JS suchen
  let form = forms.find((f) => f.id === params.id) ?? null;

  // Debug-Ausgabe, falls nichts gefunden wird
  if (!form) {
    console.warn(
      "FormDetailPage: Kein Formular mit dieser ID gefunden, params.id =",
      params.id,
      "Verfügbare IDs:",
      forms.map((f) => f.id)
    );
    // Fallback: erstes Formular anzeigen, statt 404
    form = forms[0];
  }

  const createdAt = new Date(form.createdAt).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedAt = new Date(form.updatedAt).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Formular-Details
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Detailansicht für das Lead-Formular mit seinen Feldern und
              Basisinformationen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/forms"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Zur Formular-Übersicht
            </Link>
            <Link
              href="/admin/events"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Events
            </Link>
            <Link
              href="/"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Startseite
            </Link>
          </div>
        </header>

        {/* Meta-Infos */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Formular
            </h2>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {form.name}
            </p>
            {form.description && (
              <p className="mt-1 text-sm text-slate-700">
                {form.description}
              </p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Erstellt: {createdAt}
              <br />
              Zuletzt aktualisiert: {updatedAt}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Kontext
            </h2>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Account</dt>
                <dd className="text-slate-900">
                  {form.account?.name ?? "–"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Event</dt>
                <dd className="text-slate-900">
                  {form.event
                    ? `${form.event.name} (${form.event.location ?? "–"})`
                    : "–"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  {form.isActive ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      aktiv
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                      inaktiv
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Anzahl Felder</dt>
                <dd className="text-slate-900">{form.fields.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Anzahl Leads</dt>
                <dd className="text-slate-900">{form.leads.length}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Feld-Liste */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Formularfelder
          </h2>

          {form.fields.length === 0 ? (
            <p className="text-sm text-slate-600">
              Dieses Formular enthält noch keine Felder.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-700">
                  <tr>
                    <th className="px-3 py-2">Reihenfolge</th>
                    <th className="px-3 py-2">Label</th>
                    <th className="px-3 py-2">Typ</th>
                    <th className="px-3 py-2">Pflichtfeld</th>
                    <th className="px-3 py-2">Placeholder</th>
                    <th className="px-3 py-2">Optionen</th>
                  </tr>
                </thead>
                <tbody>
                  {form.fields.map((field) => {
                    let options: string | null = null;
                    if (field.options) {
                      try {
                        const parsed = JSON.parse(field.options) as string[];
                        options = parsed.join(", ");
                      } catch {
                        options = field.options;
                      }
                    }

                    return (
                      <tr
                        key={field.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2 text-slate-700">
                          {field.order}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {field.label}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {fieldTypeLabels[field.type] ?? field.type}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {field.required ? "Ja" : "Nein"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {field.placeholder ?? "–"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {options ?? "–"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
