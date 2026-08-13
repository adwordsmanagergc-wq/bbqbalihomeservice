/* ============================================================================
 * INVOICE GENERATOR — CONFIGURATION  (edit everything here, in one place)
 * ----------------------------------------------------------------------------
 *  This is the ONLY file you need to edit to change your business details,
 *  bank details, sign-off, passcode or invoice numbering. Nothing below is
 *  hard-coded anywhere else in the invoice code.
 * ========================================================================== */
window.INVOICE_CONFIG = {

  /* ── ACCESS ────────────────────────────────────────────────────────────
   *  A single passcode unlocks the invoice tool. This is a LIGHT client-side
   *  gate only — it keeps the page out of casual sight, but anyone technical
   *  who views the page source can read it. Don't treat it as real security.
   *  Change this to whatever you like (letters and/or numbers). */
  passcode: "grill2024",

  /* ── INVOICE NUMBERING ─────────────────────────────────────────────────
   *  Numbers auto-increment and are stored so they never repeat.
   *  Format: PREFIX-YYYY-NNN   e.g.  BBQ-2026-001 */
  invoicePrefix: "BBQ",

  /* ── CURRENCY / TAX ────────────────────────────────────────────────────*/
  currencyLabel: "IDR",              // shown in the "Amount IDR" column header
  taxNote: "All taxes Included",     // small note under the total

  /* ── YOUR BUSINESS (pulled from your sample invoice) ───────────────────*/
  business: {
    name: "BBQ Bali Home Service",
    lines: ["Npwp -  53.238.475.7-902", "Bali"],   // shown under the name, top-right
    website: "www.bbqbalihomeservice.com",         // centred at the foot of the invoice
    email: "bbqbalihomeservice@gmail.com",         // shown in the payment footer
    logo: "../assets/img/logo.svg",                // logo file (relative to admin/)
  },

  /* ── BANK / PAYMENT DETAILS (shown on every invoice) ───────────────────*/
  bank: {
    heading: "Payment Transfer Details",
    accountName: "I Gede Baros",
    bankName: "Mandiri Bank",
    accountNumber: "1750001348415",
  },

  /* ── SIGN-OFF (used to sign the emailed message) ───────────────────────*/
  signOff: "I Gede Baros",

  /* ── EMAIL DEFAULTS ("Send to client" opens the mail app) ──────────────
   *  Placeholders replaced automatically:
   *    {name} {number} {total} {date} {bank} {signoff} {business} {website} */
  emailSubject: "Invoice {number} — {business}",
  emailBody:
    "Hi {name},\n\n" +
    "Thank you for choosing {business}. Please find your invoice below.\n\n" +
    "Invoice: {number}\n" +
    "Date: {date}\n" +
    "Total: {total}\n\n" +
    "{bank}\n\n" +
    "Your PDF invoice has been downloaded to this device — please attach it to this email before sending.\n\n" +
    "Kind regards,\n{signoff}\n{business}\n{website}",

  /* ── LABELS ON THE INVOICE (match your sample wording) ─────────────────*/
  labels: {
    billTo: "Bill to:",
    date: "Date of BBQ:",
    location: "Location:",
    itemCol: "Item",
    descCol: "Description",
    amountCol: "Amount",             // rendered as "Amount IDR"
    total: "Total",
  },
};
