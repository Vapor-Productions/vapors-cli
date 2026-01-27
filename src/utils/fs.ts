import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(filePath, content, 'utf8');
}

export async function writeFileSafely(
  targetPath: string,
  content: string,
  force: boolean
): Promise<void> {
  if (!force && (await fileExists(targetPath))) {
    throw new Error(`File already exists: ${targetPath}`);
  }
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, 'utf8');
}
