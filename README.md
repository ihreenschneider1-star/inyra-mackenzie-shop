# Inyra MacKenzie & Alina Solara — Homepage mit Shop

Eine Seite, ein Shop: Hero, Über-mich, Buchkatalog mit Warenkorb, echte Bezahlung über Stripe, Kontaktformular.

## Was ist was

```
index.html                    → die ganze Seite (Hero, Bio, Shop, Kontakt)
success.html / cancel.html    → Seiten nach der Zahlung
data/products.json            → DEIN BUCHKATALOG (hier trägst du Bücher ein)
assets/style.css               → Design
assets/cart.js                  → Warenkorb-Logik
assets/covers/                 → Platzhalter-Cover (durch deine Coverbilder ersetzen)
api/create-checkout-session.js → erstellt die Stripe-Zahlung
api/verify-session.js          → prüft nach der Zahlung & gibt Downloads frei
```

## 1. Kostenlos live schalten (Vercel)

1. Erstelle einen kostenlosen Account auf **github.com** und **vercel.com** (Login mit GitHub geht am schnellsten).
2. Lade diesen Ordner als neues Repository auf GitHub hoch (per Drag & Drop im Browser unter "Create new repository" → "uploading an existing file", oder mit `git push`, falls du Git nutzt).
3. Auf vercel.com: **Add New → Project** → dein GitHub-Repo auswählen → **Deploy**.
4. Nach ein bis zwei Minuten hast du eine Adresse wie `inyra-shop.vercel.app` — live, kostenlos, mit HTTPS.

Deine eigene Domain kannst du später unter **Vercel → Project → Settings → Domains** eintragen, sobald du sie gekauft hast.

## 2. Stripe einrichten (echte Zahlungen)

1. Konto auf **stripe.com** erstellen (mit deinem Gewerbe geht das direkt).
2. Im Stripe-Dashboard oben rechts ist ein Schalter **"Test mode" / "Live mode"** — starte im Testmodus, um alles gefahrlos auszuprobieren.
3. Gehe zu **Developers → API keys** und kopiere den **Secret key** (beginnt mit `sk_test_...`).
4. In Vercel: **Project → Settings → Environment Variables** → neue Variable:
   - Name: `STRIPE_SECRET_KEY`
   - Wert: dein Secret Key
   - Danach: **Redeploy** (Vercel → Deployments → die drei Punkte → Redeploy), damit die Variable greift.
5. Zum Testen: Auf der Live-Seite ein Buch in den Warenkorb legen → "Zur Kasse" → mit Stripe-Testkarte `4242 4242 4242 4242`, beliebiges zukünftiges Datum, beliebige Prüfziffer bezahlen.
6. Wenn alles funktioniert: im Stripe-Dashboard auf **Live mode** umschalten, den **Live Secret Key** (`sk_live_...`) holen und in Vercel die Umgebungsvariable damit ersetzen. Ab dann sind Zahlungen echt.

Stripe zieht pro Zahlung eine kleine Gebühr ab (aktuell ca. 1,5 % + 0,25 € pro Zahlung in der EU — die genauen Sätze zeigt dir Stripe beim Einrichten). Es fallen keine Grundgebühren an, du zahlst nur, wenn tatsächlich verkauft wird.

## 3. Bücher eintragen, ändern, löschen

Alles läuft über **eine einzige Datei**: `data/products.json`. Für jedes Buch:

```json
{
  "id": "mein-buch",
  "title": "Buchtitel",
  "author": "Inyra MacKenzie",
  "category": "Satire",
  "blurb": "Kurzbeschreibung, 1-2 Sätze.",
  "price": 999,
  "currency": "eur",
  "cover": "assets/covers/mein-cover.jpg",
  "downloadUrl": "https://dein-link-zur-datei.de/buch.pdf"
}
```

Wichtig:
- **price** ist in Cent (9,99 € = `999`).
- **downloadUrl** ist der Link, den der Käufer NACH der Zahlung bekommt. Am einfachsten: die PDF z. B. bei Google Drive oder Dropbox hochladen, Freigabelink erzeugen ("Jeder mit Link kann ansehen") und hier eintragen.
- Ich habe deinen aktuellen Katalog (Ironicus 1–3, Lilith, White Kingdom, Crowns and Thorns, Tarot-Meisterkurs) schon eingetragen — mit **Platzhalterpreisen und Platzhaltercovern**, die du noch anpassen musst.
- Nach jeder Änderung an `products.json`: Datei auf GitHub aktualisieren → Vercel deployt automatisch neu.

## 4. Eigene Cover einfügen

Lade deine Cover-Bilder in `assets/covers/` hoch (z. B. `weisses-koenigreich.jpg`) und trage den Pfad bei `cover` im jeweiligen Produkt ein. Empfohlenes Format: Hochkant, mind. 600×900 Pixel.

## 5. Kontaktformular

Das Formular nutzt aktuell einen simplen `mailto:`-Link — öffnet beim Absenden das E-Mail-Programm des Besuchers. Trage deine echte Adresse in `index.html` ein (suche nach `DEINE-EMAIL@beispiel.de`). Für ein Formular, das ohne E-Mail-Programm direkt im Hintergrund verschickt, wäre ein Dienst wie **Formspree** (kostenloser Tarif) eine spätere, unkomplizierte Erweiterung.

## 6. Rechtliches (kurzer Hinweis, keine Rechtsberatung)

Für einen echten Shop in Deutschland brauchst du normalerweise ein Impressum und eine Datenschutzerklärung auf der Seite. Sag mir Bescheid, dann bauen wir dir passende Seiten dazu — das gehört unbedingt noch rein, bevor die Seite live mit echten Zahlungen läuft.
