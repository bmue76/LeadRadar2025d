// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          LeadRadar – Developer Preview
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Dieses Projekt ist die neue Generation von LeadRadar – einer
          SaaS-Lösung zur digitalen Leaderfassung auf Messen.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Aktuell befinden wir uns im technischen Aufbau. Über die folgenden
          Links kannst du die Demo-Daten ansehen, die über Prisma und SQLite
          aus der Datenbank geladen werden.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/admin/events"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Admin – Events
          </Link>

          <Link
            href="/admin/forms"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Admin – Formulare
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Beide Seiten verwenden Prisma, um Daten direkt aus der SQLite-DB zu
          lesen.
        </p>
      </div>
    </main>
  );
}
