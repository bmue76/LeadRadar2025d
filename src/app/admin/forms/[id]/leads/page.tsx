// src/app/admin/forms/[id]/leads/page.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type FormWithContext = Prisma.FormGetPayload<{
  include: {
    account: true;
    event: true;
  };
}>;

type LeadWithValues = Prisma.LeadGetPayload<{
  include: {
    values: {
      include: {
        field: true;
      };
    };
  };
}>;

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = [
  "NEW",
  "OPEN",
  "QUALIFIED",
  "WON",
  "LOST",
  "ARCHIVED",
] as const;

type LeadStatus = (typeof ALLOWED_STATUSES)[number];

export default async function FormLeadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;

  // Status aus Querystring prüfen
  const normalizedStatus = status?.toUpperCase();
  const statusFilter: LeadStatus | undefined = ALLOWED_STATUSES.includes(
    normalizedStatus as LeadStatus
  )
    ? (normalizedStatus as LeadStatus)
    : undefined;

  const form: FormWithContext | null = await prisma.form.findUnique({
    where: { id },
    include: {
      account: true,
      event: true,
    },
  });

  if (!form) {
    notFound();
  }

  // Where-Bedingung für Prisma dynamisch aufbauen
  const where: Prisma.LeadWhereInput = {
    formId: id,
  };

  if (statusFilter) {
    where.status = statusFilter;
  }

  const leads: LeadWithValues[] = await prisma.lead.findMany({
    where,
    include: {
      values: {
        include: {
          field: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const eventInfo = form.event
    ? `${form.event.name}${
        form.event.location ? ` · ${form.event.location}` : ""
      }`
    : "Kein Event zugeordnet";

  const totalLeads = leads.length;
  const latestLead = leads[0];

  const latestAt =
    latestLead &&
    new Date(latestLead.createdAt).toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getImportantValues = (lead: LeadWithValues): string[] => {
    if (!lead.values || lead.values.length === 0) return [];

    const importantLabels = [
      "name",
      "vorname",
      "nachname",
      "firma",
      "company",
      "unternehmen",
      "email",
      "e-mail",
      "telefon",
      "phone",
    ];

    const lowered = (s: string) => s.toLowerCase();

    const sorted = [...lead.values].sort((a, b) => {
      const aImportant = importantLabels.some((label) =>
        lowered(a.field.label).includes(label)
      );
      const bImportant = importantLabels.some((label) =>
        lowered(b.field.label).includes(label)
      );
      if (aImportant === bImportant) return a.field.order - b.field.order;
      return aImportant ? -1 : 1;
    });

    return sorted
      .slice(0, 3)
      .map((v) => `${v.field.label}: ${v.value ?? ""}`.trim())
      .filter(Boolean);
  };

  const activeFilter = statusFilter ?? "ALL";

  const filterOptions: (LeadStatus | "ALL")[] = ["ALL", ...ALLOWED_STATUSES];

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
              </span>
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
              href={`/admin/forms/${form.id}/leads/export`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              CSV-Export
            </Link>
            <Link
              href={`/admin/forms/${form.id}`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Zurück zu den Formulardetails
            </Link>
          </div>
        </header>

        {/* Zusammenfassung */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Leads gesamt (Filter)
            </h2>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalLeads}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Aktueller Filter:{" "}
              <span className="font-semibold">
                {activeFilter === "ALL" ? "Alle" : activeFilter}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Zuletzt erfasst
            </h2>
            <p className="mt-2 text-sm text-slate-900">
              {latestAt ?? "–"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Zeitpunkt des zuletzt erfassten Leads im aktuellen Filter.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Event
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {form.event?.name ?? "Kein Event zugeordnet"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {form.event?.location ?? "–"}
            </p>
          </div>
        </section>

        {/* Status-Filter */}
        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nach Status filtern
            </span>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const isActive = activeFilter === option;
                const label =
                  option === "ALL"
                    ? "Alle"
                    : option === "NEW"
                    ? "NEW"
                    : option;
                const href =
                  option === "ALL"
                    ? `/admin/forms/${form.id}/leads`
                    : `/admin/forms/${form.id}/leads?status=${option}`;

                return (
                  <Link
                    key={option}
                    href={href}
                    className={`rounded-full border px-2 py-1 text-xs ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Lead-Tabelle */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Lead-Liste
            </h2>
            <p className="text-xs text-slate-500">
              Die wichtigsten Feldwerte werden inline angezeigt. Weitere Details
              sind in der Lead-Detailansicht sichtbar.
            </p>
          </div>

          {leads.length === 0 ? (
            <p className="text-sm text-slate-600">
              Für diesen Filter wurden keine Leads gefunden.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-700">
                  <tr>
                    <th className="px-3 py-2">Erfasst am</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Wichtige Angaben</th>
                    <th className="px-3 py-2">Details</th>
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

                    const importantValues = getImportantValues(lead);

                    return (
                      <tr
                        key={lead.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2 text-slate-800">
                          {createdAt}
                        </td>
                        <td className="px-3 py-2 text-slate-800">
                          {lead.status ?? "–"}
                        </td>
                        <td className="px-3 py-2 text-slate-800">
                          {importantValues.length === 0 ? (
                            <span className="text-slate-500">
                              Keine Feldwerte vorhanden
                            </span>
                          ) : (
                            <ul className="list-inside list-disc space-y-0.5">
                              {importantValues.map((v) => (
                                <li key={v}>{v}</li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-800">
                          <Link
                            href={`/admin/forms/${form.id}/leads/${lead.id}`}
                            className="text-xs font-medium text-slate-700 hover:underline"
                          >
                            Anzeigen &amp; bearbeiten
                          </Link>
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
