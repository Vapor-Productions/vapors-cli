import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const distPath = path.resolve('dist', 'index.js');

async function addShebang() {
  const content = await readFile(distPath, 'utf8');
  if (content.startsWith('#!/usr/bin/env node')) {
    return;
  }
  const updated = `#!/usr/bin/env node\n${content}`;
  await writeFile(distPath, updated, 'utf8');
}

addShebang().catch((error) => {
  console.error(`Failed to add shebang: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
