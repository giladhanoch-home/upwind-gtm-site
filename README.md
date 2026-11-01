# Upwind GTM · Home assignment presentation

Gilad Hanoch · Marketing Operations Lead home assignment for Upwind Security.

**Live:** https://giladhanoch-home.github.io/upwind-gtm-site (password protected)
**The source behind it:** the Upwind GTM Brain, readable at `/brain.html` with the same password

## How the password works
The page you land on is a welcome screen. The full presentation (`index.html`) and the Brain viewer (`brain.html`) are encrypted with AES-256-GCM. The password unlocks a key in `key.json` (PBKDF2-SHA256, 310,000 iterations), and the browser decrypts the page locally. Nothing readable is stored in this repo.

## Change the password
1. **Settings → Secrets and variables → Actions** → edit `SITE_PASSWORD`.
2. **Actions → Set site password → Run workflow.**
3. About a minute later the new password works and the old one stops working. Anyone who unlocked with the old password is asked again.

`CONTENT_KEY` is the encryption key for the page itself. Set it once and leave it alone.
