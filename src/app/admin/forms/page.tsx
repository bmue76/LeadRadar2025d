// src/app/admin/forms/page.tsx
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

type FormWithRelations = Prisma.FormGetPayload<{
  include: {
    account: true;
    event: true;
  };
}>;

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  const user = await getCurrentUser();

  // Sicherheit: falls jemand ohne Layout direkt auf /admin/forms kommt
  if (!user) {
    redirect("/login");
  }

  const forms: FormWithRelations[] = await prisma.form.findMany({
    where: {
      accountId: user.accountId, // 🔐 nur Formulare dieses Accounts
    },
    include: {
      account: true,
      event: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Formulare</h1>
            <p className="mt-1 text-sm text-slate-600">
              Du siehst hier nur Formulare für deinen Account{" "}
              <span className="font-semibold">
                {user.account?.name ?? "Unbenannter Account"}
              </span>
              .
            </p>
          </div>
          <Link
            href="/admin/forms/new"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Neues Formular anlegen
          </Link>
        </header>

        {/* Liste */}
        {forms.length === 0 ? (
          <p className="text-sm text-slate-600">
            Es sind noch keine Formulare für deinen Account angelegt. Lege jetzt
            dein erstes Formular an.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {forms.map((form) => (
              <li
                key={form.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h2 className="text-sm font-semibold text-slate-900">
                  {form.name}
                </h2>

                {form.event && (
                  <p className="mt-1 text-xs text-slate-500">
                    Event: {form.event.name}
                    {form.event.location ? ` · ${form.event.location}` : ""}
                  </p>
                )}

                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {form.description ?? "Kein Beschreibungstext hinterlegt."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Link
                    href={`/admin/forms/${form.id}`}
                    className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-100"
                  >
                    Details anzeigen
                  </Link>
                  <Link
                    href={`/admin/forms/${form.id}/leads`}
                    className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-100"
                  >
                    Leads anzeigen
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
