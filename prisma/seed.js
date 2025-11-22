// prisma/seed.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starte Seeding ...");

  // 1) Account
  const account = await prisma.account.create({
    data: {
      name: "Demo Company AG",
    },
  });

  // 2) User
  const user = await prisma.user.create({
    data: {
      email: "demo@leadradar.local",
      name: "Demo User",
      role: "OWNER",
      accountId: account.id,
    },
  });

  // 3) Event (Messe)
  const event = await prisma.event.create({
    data: {
      accountId: account.id,
      name: "Demo Messe 2025",
      location: "Zürich",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-03"),
      isActive: true,
    },
  });

  // 4) Formular mit Feldern
  const form = await prisma.form.create({
    data: {
      accountId: account.id,
      eventId: event.id,
      name: "Standard Lead-Formular",
      description: "Demo-Formular für die Demo Messe 2025",
      isActive: true,
      fields: {
        create: [
          { type: "TEXT", label: "Vorname", required: true, order: 1 },
          { type: "TEXT", label: "Nachname", required: true, order: 2 },
          { type: "EMAIL", label: "E-Mail", required: false, order: 3 },
          {
            type: "SELECT",
            label: "Interesse",
            required: true,
            order: 4,
            options: JSON.stringify(["Produkt A", "Produkt B", "Beratung"]),
          },
          {
            type: "TEXTAREA",
            label: "Notizen",
            required: false,
            order: 5,
          },
        ],
      },
    },
    include: {
      fields: true,
    },
  });

  // 5) Beispiel-Lead mit Antworten
  const vornameField = form.fields.find((f) => f.label === "Vorname");
  const nachnameField = form.fields.find((f) => f.label === "Nachname");
  const emailField = form.fields.find((f) => f.label === "E-Mail");
  const interesseField = form.fields.find((f) => f.label === "Interesse");

  const lead = await prisma.lead.create({
    data: {
      accountId: account.id,
      eventId: event.id,
      formId: form.id,
      createdByUserId: user.id,
      status: "NEW",
      answers: {
        create: [
          {
            formFieldId: vornameField.id,
            value: "Anna",
          },
          {
            formFieldId: nachnameField.id,
            value: "Muster",
          },
          {
            formFieldId: emailField.id,
            value: "anna.muster@example.com",
          },
          {
            formFieldId: interesseField.id,
            value: "Produkt A",
          },
        ],
      },
    },
  });

  console.log("✅ Seeding abgeschlossen.");
  console.log(`- Account: ${account.name}`);
  console.log(`- User: ${user.email}`);
  console.log(`- Event: ${event.name}`);
  console.log(`- Formular: ${form.name} mit ${form.fields.length} Feldern`);
  console.log(`- Lead-ID: ${lead.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Fehler beim Seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
