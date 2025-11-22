// src/app/admin/events/page.tsx
import { prisma } from "@/lib/prisma";
import type { Event, Account, Form, Lead } from "@prisma/client";
import Link from "next/link";

// Event inkl. verknüpfter Daten (Account, Forms, Leads)
type EventWithRelations = Event & {
  account: Account | null;
  forms: Form[];
  leads: Lead[];
};

export const dynamic = "force-dynamic"; // sicherstellen, dass immer frische Daten geladen werden

export default async function AdminEventsPage() {
  const events: EventWithRelations[] = await prisma.event.findMany({
    include: {
      account: true,
      forms: true,
      leads: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              LeadRadar – Admin / Events
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Übersicht aller Messen/Events aus der Datenbank (Demo-Daten).
            </p>
          </div>

          <Link
            href="/"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Zur Startseite
          </Link>
        </header>

        {events.length === 0 ? (
          <p className="text-slate-600">
            Aktuell sind keine Events in der Datenbank. Führe ggf.{" "}
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
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Ort</th>
                  <th className="px-4 py-3">Zeitraum</th>
                  <th className="px-4 py-3 text-right">Formulare</th>
                  <th className="px-4 py-3 text-right">Leads</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
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

                  return (
                    <tr
                      key={event.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {event.name}
                        {!event.isActive && (
                          <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-normal text-slate-700">
                            inaktiv
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {event.account?.name ?? "–"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {event.location ?? "–"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {start && end ? `${start} – ${end}` : "–"}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {event.forms.length}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {event.leads.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
