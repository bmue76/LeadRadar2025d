# LeadRadar 2025d

LeadRadar ist eine SaaS-Lösung zur **digitalen Leaderfassung auf Messen**.  
Ziel: Leads strukturiert erfassen, qualifizieren, auswerten und in andere Systeme exportieren – ohne Papier, ohne Chaos.

---

## 🎯 Vision

- Einfache, schnelle Leaderfassung für Messe-Teams.
- Voll flexibel dank **Formular-Editor** im Web.
- Erfassung über **Mobile Apps** (Android/iOS) mit Online-/Offline-Funktion.
- Standard-Exporte für Excel/CSV sowie Schnittstellen zu CRM-Systemen (optional).

---

## 👥 Zielgruppen & Rollen (erste Version)

- **Account Owner / Kunde**  
  Kauft das Abo, verwaltet Messen & Formulare, sieht Auswertungen.

- **Messe-Admin / Marketing**  
  Richtet Formulare für eine Messe ein, verteilt Logins, prüft Ergebnisse.

- **Messe-User (Tablet/Smartphone auf der Messe)**  
  Erfasst Leads direkt am Stand (Visitenkarte, QR, manuelle Eingabe).

- **Viewer / Management**  
  Liest Auswertungen, aber bearbeitet keine Leads.

Diese Rollen werden später im Kapitel **Auth & Mandanten** (Kapitel 8) konkretisiert.

---

## 🔄 High-Level-Flow

### Vor der Messe
- Kunde legt eine **Messe / Veranstaltung** an.
- Kunde/Admin erstellt mit dem **Formular-Editor** das Lead-Formular:
  - Stammdaten (Name, Firma, Kontakt)
  - Qualifikationsfragen (Interesse, Budget, Timing, Produktkategorien)
  - Tags/Checkboxen (z. B. „Follow-up durch Vertrieb“, „Demo gewünscht“)
- Messe-User erhalten Zugang zur App und wählen die Messe/Formulare aus.

### Während der Messe
- Messe-User öffnen die **LeadRadar-App**.
- Wählen Messe + Formular.
- Erfassen Leads:
  - Manuelle Eingabe
  - Optional: Foto/Scan einer Visitenkarte (später)
  - Status/Qualität vergeben (A/B/C/Hot/…).

### Nach der Messe
- Leads stehen im **Web-Frontend** zur Verfügung.
- Filter & einfache Auswertungen (z. B. pro Tag, pro Messe, pro User).
- Export als **CSV/Excel**, Übergabe ins CRM.

---

## 🧱 Geplanter Tech-Stack

- **Frontend & Backend:**  
  - [Next.js](https://nextjs.org/) (App Router)  
  - [React](https://react.dev/)  
  - [TypeScript](https://www.typescriptlang.org/)  

- **Styling:**  
  - [Tailwind CSS](https://tailwindcss.com/)

- **Datenzugriff & Datenbank (Dev):**  
  - [Prisma ORM](https://www.prisma.io/)  
  - SQLite als lokale Entwicklungsdatenbank (später Umzug auf PostgreSQL in der Cloud)

- **Mobile App (später):**  
  - Expo / React Native (TypeScript)

- **Versionsverwaltung & Hosting:**  
  - Git & GitHub  
  - Später voraussichtlich Vercel (Free Tier) für das Web-Frontend

---

## 🧩 Projektkapitel (Arbeitsstruktur)

1. Setup & Architektur-Grundlagen  
2. Fachkonzept & UX-Flows  
3. Datenmodell & Datenbank (Prisma + SQLite)  
4. Backend-API & Business-Logik  
5. Web-Frontend: Admin & Formular-Editor  
6. Mobile App(s) für Leaderfassung  
7. Export, Reporting & Integrationen  
8. Authentifizierung, Mandanten & Abrechnung  
9. Deployment, Betrieb & Dokumentation

Diese Datei dient als Einstiegspunkt. Detailliertere technische Dokus kommen später unter `docs/`.

---

## 📁 Aktuelle Projektstruktur (Start)

- `src/app` – Seiten & Routen der Next.js-App  
- `public` – statische Assets (Logos, Icons, Bilder)  
- `package.json` – Projektkonfiguration & Dependencies  
- `README.md` – diese Projektübersicht

---

## ✅ Nächste Schritte (Kurz)

- Fachkonzept & UX-Flows verfeinern (User Stories, Screens).  
- Datenmodell als Prisma-Schema aufsetzen (Kapitel 3).  
- Erste API-Routen & Seiten für Formulare und Leads anlegen (Kapitel 4 & 5).
