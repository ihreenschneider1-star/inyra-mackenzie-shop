// ============================================================
// Prüft nach der Zahlung, ob die Stripe-Session wirklich bezahlt ist,
// und gibt die Download-Links der gekauften Bücher zurück.
// Läuft unter /api/verify-session?session_id=...
// ============================================================
const Stripe = require("stripe");
const products = require("../data/products.json");

module.exports = async function handler(req, res) {
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500).json({ error: "STRIPE_SECRET_KEY fehlt." });
    return;
  }
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { session_id } = req.query;
    if (!session_id) {
      res.status(400).json({ error: "session_id fehlt." });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      res.status(402).json({ error: "Zahlung noch nicht abgeschlossen." });
      return;
    }

    const productIds = (session.metadata.productIds || "").split(",").filter(Boolean);
    const items = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ title: p.title, downloadUrl: p.downloadUrl }));

    res.status(200).json({ paid: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Session konnte nicht geprüft werden." });
  }
};
