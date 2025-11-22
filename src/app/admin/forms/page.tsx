// src/app/admin/forms/page.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";

// Form inkl. verknüpfter Daten (Account, Event, Fields, Leads)
type FormWithRelations = Prisma.FormGetPayload<{
  include: {
    account: true;
    event: true;
    fields: true;
    leads: true;
  };
}>;

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  const forms: FormWithRelations[] = await prisma.form.findMany({
    include: {
      account: true,
      event: true,
      fields: true,
      leads: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              LeadRadar – Admin / Formulare
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Übersicht aller Lead-Formulare inkl. zugehörigem Event, Account
              und Anzahl Felder/Leads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

        {forms.length === 0 ? (
          <p className="text-slate-600">
            Aktuell sind keine Formulare in der Datenbank. Führe ggf.{" "}
            <code className="rounded bg-slate-200 px-1 text-xs">
              npm run db:seed
            </code>{" "}
            aus.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th className="px-4 py-3">Formular</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3 text-right">Felder</th>
                  <th className="px-4 py-3 text-right">Leads</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr
                    key={form.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {form.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {form.account?.name ?? "–"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {form.event
                        ? `${form.event.name} (${form.event.location ?? "–"})`
                        : "–"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {form.fields.length}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {form.leads.length}
                    </td>
                    <td className="px-4 py-3 text-right">
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
