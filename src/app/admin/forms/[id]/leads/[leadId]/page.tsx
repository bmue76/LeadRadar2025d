// src/app/admin/forms/[id]/leads/[leadId]/page.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type LeadWithEverything = Prisma.LeadGetPayload<{
  include: {
    form: {
      include: {
        account: true;
        event: true;
      };
    };
    values: {
      include: {
        field: true;
      };
    };
  };
}>;

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string; leadId: string }>;
}) {
  const { id: formId, leadId } = await params;

  const lead: LeadWithEverything | null = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      form: {
        include: {
          account: true,
          event: true,
        },
      },
      values: {
        include: {
          field: true,
        },
      },
    },
  });

  if (!lead || lead.formId !== formId) {
    notFound();
  }

  const { form } = lead;

  const createdAt = new Date(lead.createdAt).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedAt = new Date(lead.updatedAt).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const eventInfo = form.event
    ? `${form.event.name}${
        form.event.location ? ` · ${form.event.location}` : ""
      }`
    : "Kein Event zugeordnet";

  const statusLabel = lead.status ?? "NEW";

  const statusOptions = [
    "NEW",
    "OPEN",
    "QUALIFIED",
    "WON",
    "LOST",
    "ARCHIVED",
  ] as const;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Lead-Details
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Einzelansicht eines Leads für das Formular{" "}
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
              href={`/admin/forms/${form.id}/leads`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Zurück zur Lead-Liste
            </Link>
            <Link
              href={`/admin/forms/${form.id}`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Formulardetails
            </Link>
          </div>
        </header>

        {/* Meta + Status */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Lead
            </h2>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Lead-ID</dt>
                <dd className="text-xs font-mono text-slate-900">
                  {lead.id}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Erfasst am</dt>
                <dd className="text-slate-900">{createdAt}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Zuletzt aktualisiert</dt>
                <dd className="text-slate-900">{updatedAt}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Status bearbeiten
            </h2>
            <form
              action="/api/leads/status"
              method="post"
              className="mt-3 space-y-3"
            >
              <input type="hidden" name="leadId" value={lead.id} />
              <input type="hidden" name="formId" value={form.id} />
              <input
                type="hidden"
                name="redirectTo"
                value={`/admin/forms/${form.id}/leads/${lead.id}`}
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={statusLabel}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Status speichern
              </button>
            </form>
          </div>
        </section>

        {/* Feldwerte */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Erfasste Feldwerte
          </h2>

          {lead.values.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Für diesen Lead wurden keine Feldwerte gespeichert.
            </p>
          ) : (
            <dl className="mt-3 divide-y divide-slate-100">
              {lead.values
                .slice()
                .sort((a, b) => a.field.order - b.field.order)
                .map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col gap-1 py-2 text-sm md:flex-row md:items-start md:gap-4"
                  >
                    <dt className="w-48 shrink-0 text-slate-500">
                      {v.field.label}
                      {v.field.required && (
                        <span className="ml-1 text-xs text-rose-500">*</span>
                      )}
                    </dt>
                    <dd className="flex-1 whitespace-pre-wrap text-slate-900">
                      {v.value ?? "–"}
                    </dd>
                  </div>
                ))}
            </dl>
          )}
        </section>
      </div>
    </main>
  );
}
