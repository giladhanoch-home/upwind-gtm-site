// Re-wraps the content key with a new password and writes key.json.
// Run by .github/workflows/set-password.yml with the SITE_PASSWORD and CONTENT_KEY secrets.
import { writeFileSync } from 'node:fs';
import { wrap } from './crypto.mjs';

const pw = process.env.SITE_PASSWORD, ck = process.env.CONTENT_KEY;
if (!ck) { console.error('Missing CONTENT_KEY secret'); process.exit(1); }
const k = await wrap(pw, ck);
writeFileSync(new URL('../key.json', import.meta.url), JSON.stringify(k, null, 2) + '\n');
console.log('key.json updated, version', k.v);
