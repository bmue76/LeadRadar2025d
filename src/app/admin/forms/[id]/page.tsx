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
  params: Promise<{ id: string }>;
}) {
  // Next 16 / React 19: params ist ein Promise
  const { id } = await params;
  console.log("FormDetailPage params.id =", id);

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
    notFound();
  }

  let form = forms.find((f) => f.id === id) ?? null;

  if (!form) {
    console.warn(
      "FormDetailPage: Kein Formular mit dieser ID gefunden, params.id =",
      id,
      "Verfügbare IDs:",
      forms.map((f) => f.id)
    );
    form = forms[0];
  }

  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);

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

  const nextOrder =
    sortedFields.length > 0
      ? sortedFields[sortedFields.length - 1].order + 1
      : 1;

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
              href={`/admin/forms/${form.id}/preview`}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Formular-Preview
            </Link>
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
                <dd className="text-slate-900">{sortedFields.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Anzahl Leads</dt>
                <dd className="text-slate-900">{form.leads.length}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Formularfelder + Neues Feld */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Formularfelder
            </h2>
            <p className="text-xs text-slate-500">
              Neues Feld unten hinzufügen. Optionen mit Komma trennen.
            </p>
          </div>

          {/* Neues Feld hinzufügen */}
          <form
            action="/api/form-fields"
            method="post"
            className="mb-6 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <input type="hidden" name="formId" value={form.id} />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Label *
                </label>
                <input
                  name="label"
                  required
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  placeholder="z.B. Firmenname"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Feldtyp *
                </label>
                <select
                  name="type"
                  required
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white"
                  defaultValue="TEXT"
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
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  defaultValue={nextOrder}
                  min={1}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Placeholder
                </label>
                <input
                  name="placeholder"
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  placeholder="z.B. Bitte E-Mail-Adresse eingeben"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[auto,1fr] items-center">
              <div className="flex items-center gap-2">
                <input
                  id="required"
                  name="required"
                  type="checkbox"
                  defaultChecked
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
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Feld hinzufügen
              </button>
            </div>
          </form>

          {/* Bestehende Felder */}
          {sortedFields.length === 0 ? (
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
                    <th className="px-3 py-2 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFields.map((field, index) => {
                    let options: string | null = null;
                    if (field.options) {
                      try {
                        const parsed = JSON.parse(field.options) as string[];
                        options = parsed.join(", ");
                      } catch {
                        options = field.options;
                      }
                    }

                    const isFirst = index === 0;
                    const isLast = index === sortedFields.length - 1;

                    const reorderButtonClasses =
                      "rounded border border-slate-300 px-1.5 py-0.5 text-[11px] leading-none text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent";

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
                        <td className="px-3 py-2 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {/* Reihenfolge: hoch / runter */}
                            <form
                              action="/api/form-fields/reorder"
                              method="post"
                              className="inline"
                            >
                              <input
                                type="hidden"
                                name="fieldId"
                                value={field.id}
                              />
                              <input
                                type="hidden"
                                name="formId"
                                value={form.id}
                              />
                              <input
                                type="hidden"
                                name="direction"
                                value="up"
                              />
                              <button
                                type="submit"
                                disabled={isFirst}
                                className={reorderButtonClasses}
                              >
                                ↑
                              </button>
                            </form>
                            <form
                              action="/api/form-fields/reorder"
                              method="post"
                              className="inline"
                            >
                              <input
                                type="hidden"
                                name="fieldId"
                                value={field.id}
                              />
                              <input
                                type="hidden"
                                name="formId"
                                value={form.id}
                              />
                              <input
                                type="hidden"
                                name="direction"
                                value="down"
                              />
                              <button
                                type="submit"
                                disabled={isLast}
                                className={reorderButtonClasses}
                              >
                                ↓
                              </button>
                            </form>

                            {/* Bearbeiten & Löschen */}
                            <Link
                              href={`/admin/forms/${form.id}/fields/${field.id}`}
                              className="text-xs text-slate-700 hover:underline"
                            >
                              Bearbeiten
                            </Link>
                            <form
                              action="/api/form-fields/delete"
                              method="post"
                              className="inline"
                            >
                              <input
                                type="hidden"
                                name="fieldId"
                                value={field.id}
                              />
                              <input
                                type="hidden"
                                name="formId"
                                value={form.id}
                              />
                              <button
                                type="submit"
                                className="text-xs text-red-600 hover:underline"
                              >
                                Löschen
                              </button>
                            </form>
                          </div>
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
