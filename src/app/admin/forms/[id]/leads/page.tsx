// src/app/admin/forms/[id]/leads/page.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type LeadWithValues = Prisma.LeadGetPayload<{
  include: {
    values: {
      include: {
        field: true;
      };
    };
  };
}>;

type FormWithFields = Prisma.FormGetPayload<{
  include: {
    account: true;
    event: true;
    fields: true;
  };
}>;

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  NEW: "Neu",
  OPEN: "In Bearbeitung",
  QUALIFIED: "Qualifiziert",
  WON: "Gewonnen",
  LOST: "Verloren",
  ARCHIVED: "Archiviert",
};

function formatStatus(status: unknown): string {
  // Wir akzeptieren alles (Enum, string, null, undefined)
  if (!status) return "Neu";
  const key = String(status);
  return statusLabels[key] ?? key;
}

function formatFieldValue(raw: string | null): string {
  if (!raw) return "–";

  // Multi-Select / JSON-Array versuchen zu erkennen
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
  } catch {
    // ignorieren, wenn kein valides JSON
  }

  return raw;
}

export default async function FormLeadsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const form: FormWithFields | null = await prisma.form.findUnique({
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

  const leads: LeadWithValues[] = await prisma.lead.findMany({
    where: { formId: id },
    include: {
      values: {
        include: { field: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);
  // Wir zeigen in der Tabelle die ersten 3 Felder des Formulars an
  const displayFields = sortedFields.slice(0, 3);

  const eventInfo = form.event
    ? `${form.event.name}${
        form.event.location ? ` · ${form.event.location}` : ""
      }`
    : "Kein Event zugeordnet";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Leads zum Formular
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Übersicht aller erfassten Leads für das Formular{" "}
              <span className="font-semibold text-slate-900">
                {form.name}
              </span>{" "}
              ({eventInfo}).
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Account:{" "}
              <span className="font-medium">
                {form.account?.name ?? "–"}
              </span>{" "}
              · Anzahl Leads:{" "}
              <span className="font-medium">{leads.length}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/forms/${form.id}/capture`}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Lead erfassen
            </Link>
            <Link
              href={`/admin/forms/${form.id}`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Zurück zu den Formulardetails
            </Link>
            <Link
              href="/admin/forms"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Formular-Übersicht
            </Link>
          </div>
        </header>

        {/* Lead-Liste */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {leads.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Für dieses Formular wurden noch keine Leads erfasst.
              </p>
              <Link
                href={`/admin/forms/${form.id}/capture`}
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Jetzt ersten Lead erfassen
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-slate-500">
                Es werden die ersten drei Formularfelder als Spalten angezeigt.
                Die Detailansicht und Export-Funktionen können später ergänzt
                werden.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-700">
                    <tr>
                      <th className="px-3 py-2">Erfasst am</th>
                      <th className="px-3 py-2">Status</th>
                      {displayFields.map((field) => (
                        <th key={field.id} className="px-3 py-2">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => {
                      const createdAt = new Date(
                        lead.createdAt
                      ).toLocaleString("de-CH", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const valueMap: Record<string, string | null> = {};
                      lead.values.forEach((v) => {
                        valueMap[v.fieldId] = v.value;
                      });

                      return (
                        <tr
                          key={lead.id}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-3 py-2 text-slate-800">
                            {createdAt}
                          </td>
                          <td className="px-3 py-2 text-slate-800">
                            {formatStatus((lead as any).status)}
                          </td>
                          {displayFields.map((field) => (
                            <td
                              key={field.id}
                              className="px-3 py-2 text-slate-800"
                            >
                              {formatFieldValue(valueMap[field.id] ?? null)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
