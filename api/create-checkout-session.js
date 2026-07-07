// ============================================================
// Erstellt eine echte Stripe-Checkout-Session.
// Läuft als Vercel Serverless Function unter /api/create-checkout-session
// Braucht die Umgebungsvariable STRIPE_SECRET_KEY (siehe README).
// ============================================================
const Stripe = require("stripe");
const products = require("../data/products.json");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500).json({ error: "STRIPE_SECRET_KEY fehlt. Siehe README zum Einrichten." });
    return;
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ error: "Warenkorb ist leer." });
      return;
    }

    // Preise werden serverseitig aus products.json geholt -
    // niemals dem Browser vertrauen, was ein Produkt kosten soll.
    const line_items = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({
        price_data: {
          currency: p.currency,
          product_data: { name: p.title, description: `${p.author} — ${p.category}` },
          unit_amount: p.price,
        },
        quantity: 1,
      }));

    if (line_items.length === 0) {
      res.status(400).json({ error: "Keine gültigen Produkte im Warenkorb." });
      return;
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      metadata: { productIds: productIds.join(",") },
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel.html`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Zahlung konnte nicht erstellt werden." });
  }
};
