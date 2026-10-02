import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const context = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'content.js'), 'utf8'), context);
for (const document of context.window.CONTENT.documents.items) {
  const bytes = await readFile(path.join(root, 'downloads', document.file));
  if (bytes.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error(`Invalid PDF: ${document.file}`);
  }
}
await mkdir(output, { recursive: true });
for (const item of ['index.html', 'styles.css', 'app.js', 'content.js', 'assets', 'downloads']) {
  await cp(path.join(root, item), path.join(output, item), { recursive: true });
}
await writeFile(path.join(output, '.nojekyll'), '');
console.log('Built partnership website with all four PDF downloads in dist/.');
