// A baseline list of sensitive domains that should NEVER be tracked.
// We only need the root domains here, as our firewall will match subdomains against them.

export const DEFAULT_IGNORED_DOMAINS = new Set([
  // Email / Comms
  "mail.google.com",
  "outlook.live.com",
  "yahoo.com",
  "proton.me",
  "mail.yahoo.com",
  "icloud.com",

  // Banking / Finance
  "paypal.com",
  "chase.com",
  "bankofamerica.com",
  "wellsfargo.com",
  "citi.com",
  "capitalone.com",
  "stripe.com",
  "americanexpress.com",
  "paytm.com",

  // Password Managers / Security
  "1password.com",
  "lastpass.com",
  "bitwarden.com",
  "dashlane.com",
  "nordpass.com",
  "authy.com",

  // Cloud Storage (Personal files)
  "drive.google.com",
  "dropbox.com",
  "onedrive.live.com",
  "box.com",

  // Intranet / Local
  "localhost",
  "127.0.0.1",
]);