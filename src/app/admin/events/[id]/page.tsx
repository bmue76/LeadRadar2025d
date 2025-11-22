// src/app/admin/events/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    account: true;
    forms: {
      include: {
        fields: true;
      };
    };
    leads: true;
  };
}>;

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  console.log("EventDetailPage params.id =", params.id);

  // Alle Events inkl. Relationen holen
  const events: EventWithRelations[] = await prisma.event.findMany({
    include: {
      account: true,
      forms: {
        include: {
          fields: true,
        },
      },
      leads: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  if (events.length === 0) {
    notFound();
  }

  // Event per ID suchen, sonst erstes Event als Fallback
  let event = events.find((e) => e.id === params.id) ?? null;

  if (!event) {
    console.warn(
      "EventDetailPage: Kein Event mit dieser ID gefunden, params.id =",
      params.id,
      "Verfügbare IDs:",
      events.map((e) => e.id)
    );
    event = events[0];
  }

  const start =
    event.startDate &&
    new Date(event.startDate).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const end =
    event.endDate &&
    new Date(event.endDate).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const createdAt = new Date(event.createdAt).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedAt = new Date(event.updatedAt).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const countLeadsForForm = (formId: string) =>
    event.leads.filter((lead) => lead.formId === formId).length;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Event-Details</h1>
            <p className="mt-1 text-sm text-slate-600">
              Detailansicht für eine Messe / ein Event inkl. zugehöriger
              Formulare und Leads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/events"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Zur Event-Übersicht
            </Link>
            <Link
              href="/admin/forms"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Formulare
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
              Event
            </h2>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {event.name}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {event.location ?? "Ort noch nicht definiert"}
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Zeitraum:{" "}
              {start && end ? (
                <>
                  {start} – {end}
                </>
              ) : (
                "noch nicht vollständig definiert"
              )}
            </p>
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
                  {event.account?.name ?? "–"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  {event.isActive ? (
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
                <dt className="text-slate-500">Formulare</dt>
                <dd className="text-slate-900">{event.forms.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Leads gesamt</dt>
                <dd className="text-slate-900">{event.leads.length}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Formular-Liste */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Formulare zu diesem Event
          </h2>

          {event.forms.length === 0 ? (
            <p className="text-sm text-slate-600">
              Für dieses Event sind noch keine Formulare erfasst.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-700">
                  <tr>
                    <th className="px-3 py-2">Formular</th>
                    <th className="px-3 py-2">Beschreibung</th>
                    <th className="px-3 py-2 text-right">Felder</th>
                    <th className="px-3 py-2 text-right">Leads</th>
                    <th className="px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {event.forms.map((form) => {
                    const leadsForForm = countLeadsForForm(form.id);

                    return (
                      <tr
                        key={form.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2 font-medium text-slate-900">
                          <Link
                            href={`/admin/forms/${form.id}`}
                            className="underline-offset-2 hover:underline"
                          >
                            {form.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {form.description ?? "–"}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700">
                          {form.fields.length}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700">
                          {leadsForForm}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {form.isActive ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                              aktiv
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                              inaktiv
                            </span>
                          )}
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
